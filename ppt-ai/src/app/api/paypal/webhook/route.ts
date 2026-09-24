import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getPayPalBaseUrl } from "@/server/paypal/client";
import { getPayPalSubscription, syncSubscriptionFromPayPal } from "@/server/paypal/subscriptions";
import {
  extractBillingAgreementId,
  extractPaymentAmount,
  type PayPalWebhookEvent,
  verifyPayPalWebhook,
} from "@/server/paypal/webhook";
import { db } from "@/server/db";
import { env } from "@/env";

async function findSubscriptionByAgreementId(agreementId: string | undefined) {
  // Without an id there is nothing to match. (Passing `undefined` to a Prisma
  // filter drops the condition and would match an arbitrary subscription.)
  if (!agreementId) return null;
  return db.subscription.findFirst({
    where: {
      OR: [
        { paypalBillingAgreementId: agreementId },
        { paypalSubscriptionId: agreementId },
      ],
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const isValid = await verifyPayPalWebhook({
    headers: request.headers,
    rawBody: body,
    webhookId: env.PAYPAL_WEBHOOK_ID,
    baseUrl: getPayPalBaseUrl(),
    getAccessToken,
  });
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(body) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  const resource = event.resource ?? {};
  console.log("[PayPal webhook] event:", eventType, event.id);

  try {
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        if (!resource.id) break;
        const subscription = await getPayPalSubscription(resource.id);
        if (!subscription) break;

        const dbSubscription = await db.subscription.findUnique({
          where: { paypalSubscriptionId: subscription.id },
          include: { user: true },
        });
        if (!dbSubscription) break;

        await syncSubscriptionFromPayPal(dbSubscription.userId, subscription);

        if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" && dbSubscription.user.email) {
          const plan = await db.subscriptionPlan.findFirst({
            where: {
              OR: [
                { paypalPlanIdMonthly: subscription.planId },
                { paypalPlanIdYearly: subscription.planId },
              ],
            },
            select: { displayName: true },
          });
          // The amount object is passed through from PayPal as-is (snake_case).
          const lastPayment = subscription.billingInfo?.lastPayment?.amount as
            | { value?: string; currency_code?: string; currencyCode?: string }
            | undefined;
          const price = lastPayment?.value
            ? `${lastPayment.value} ${lastPayment.currency_code ?? lastPayment.currencyCode ?? ""}`.trim()
            : "";
          const { EmailService } = await import("@/server/email/service");
          await EmailService.sendSubscriptionSuccess(
            dbSubscription.user.email,
            dbSubscription.user.name ?? "Customer",
            plan?.displayName ?? "your plan",
            price,
          );
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        if (!resource.id) break;
        const status =
          eventType === "BILLING.SUBSCRIPTION.EXPIRED"
            ? "EXPIRED"
            : eventType === "BILLING.SUBSCRIPTION.SUSPENDED"
              ? "PAST_DUE"
              : "CANCELLED";
        await db.subscription.updateMany({
          where: { paypalSubscriptionId: resource.id },
          data: { status, cancelAtPeriodEnd: false },
        });
        break;
      }

      case "PAYMENT.SALE.COMPLETED":
      case "PAYMENT.CAPTURE.COMPLETED": {
        if (!resource.id) break;
        const subscription = await findSubscriptionByAgreementId(
          extractBillingAgreementId(resource),
        );
        if (!subscription) break;

        const { amount, currency } = extractPaymentAmount(resource);
        // Idempotent: PayPal retries deliveries, so key on the transaction id.
        await db.payment.upsert({
          where: { paypalTransactionId: resource.id },
          create: {
            subscriptionId: subscription.id,
            amount,
            currency,
            status: "SUCCEEDED",
            paypalTransactionId: resource.id,
            paidAt: new Date(),
          },
          update: { status: "SUCCEEDED" },
        });
        break;
      }

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.CAPTURE.DENIED": {
        if (!resource.id) break;
        const subscription = await findSubscriptionByAgreementId(
          extractBillingAgreementId(resource),
        );
        if (!subscription) break;

        const { amount, currency } = extractPaymentAmount(resource);
        await db.payment.upsert({
          where: { paypalTransactionId: resource.id },
          create: {
            subscriptionId: subscription.id,
            amount,
            currency,
            status: "FAILED",
            paypalTransactionId: resource.id,
          },
          update: { status: "FAILED" },
        });
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      default:
        console.log("[PayPal webhook] unhandled event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal webhook] processing failed:", error);
    // 500 makes PayPal retry, which is safe because handlers are idempotent.
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
