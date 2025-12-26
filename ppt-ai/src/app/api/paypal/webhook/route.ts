import { NextRequest, NextResponse } from "next/server";
import { getPayPalClient } from "@/server/paypal/client";
import { getPayPalSubscription, syncSubscriptionFromPayPal } from "@/server/paypal/subscriptions";
import { db } from "@/server/db";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { env } from "@/env";

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhook(
  headers: Headers,
  body: string,
): Promise<boolean> {
  // PayPal webhook verification
  // In production, implement proper signature verification
  // See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/
  return true; // Simplified for now
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // Verify webhook signature
    const isValid = await verifyWebhook(headers, body);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body) as {
      eventType: string;
      resource: {
        id?: string;
        status?: string;
        billingAgreementId?: string;
        [key: string]: unknown;
      };
    };

    console.log("PayPal webhook event:", event.eventType);

    // Handle different event types
    switch (event.eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        if (event.resource.id) {
          const subscription = await getPayPalSubscription(event.resource.id);
          if (subscription) {
            // Find user by subscription ID
            const dbSubscription = await db.subscription.findUnique({
              where: { paypalSubscriptionId: subscription.id },
              include: { user: true },
            });

            if (dbSubscription) {
              await syncSubscriptionFromPayPal(
                dbSubscription.userId,
                subscription,
              );

              // Send email on activation
              if (event.eventType === "BILLING.SUBSCRIPTION.ACTIVATED" && dbSubscription.user.email) {
                const { EmailService } = await import("@/server/email/service");
                const planName = dbSubscription.planId === "PRO" ? "Pro Plan" : "Enterprise Plan";
                await EmailService.sendSubscriptionSuccess(
                  dbSubscription.user.email,
                  dbSubscription.user.name ?? "Customer",
                  planName,
                  subscription.billingInfo?.lastPayment?.amount?.value ?? "$19.00"
                );
              }
            }
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        if (event.resource.id) {
          const subscription = await db.subscription.findUnique({
            where: { paypalSubscriptionId: event.resource.id },
          });

          if (subscription) {
            await db.subscription.update({
              where: { id: subscription.id },
              data: {
                status: "CANCELLED",
                cancelAtPeriodEnd: false,
              },
            });
          }
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED":
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Record payment
        const paymentData = event.resource as {
          id: string;
          amount: { value: string; currency_code: string };
          billing_agreement_id?: string;
        };

        const subscription = await db.subscription.findFirst({
          where: {
            OR: [
              { paypalBillingAgreementId: paymentData.billing_agreement_id },
              { paypalSubscriptionId: paymentData.billing_agreement_id },
            ],
          },
        });

        if (subscription) {
          await db.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: parseFloat(paymentData.amount.value),
              currency: paymentData.amount.currency_code.toLowerCase(),
              status: "SUCCEEDED",
              paypalTransactionId: paymentData.id,
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.CAPTURE.DENIED": {
        // Handle failed payment
        const paymentData = event.resource as {
          id: string;
          billing_agreement_id?: string;
        };

        const subscription = await db.subscription.findFirst({
          where: {
            OR: [
              { paypalBillingAgreementId: paymentData.billing_agreement_id },
              { paypalSubscriptionId: paymentData.billing_agreement_id },
            ],
          },
        });

        if (subscription) {
          await db.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: 0,
              currency: "usd",
              status: "FAILED",
              paypalTransactionId: paymentData.id,
            },
          });

          // Update subscription status
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      default:
        console.log("Unhandled webhook event:", event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
