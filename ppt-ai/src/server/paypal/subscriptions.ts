import { getPayPalBaseUrl } from "./client";
import type { PayPalSubscription } from "./types";
import { db } from "@/server/db";
import { env } from "@/env";

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  console.log("Creating PayPal subscription for user:", userId);

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  console.log("User lookup result:", {
    found: !!user,
    userId: userId,
    userEmail: user?.email,
  });

  if (!user) {
    console.error("User not found in database with ID:", userId);
    throw new Error("User not found");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      subscriber: {
        name: {
          given_name: user.name?.split(" ")[0] ?? "User",
          surname: user.name?.split(" ").slice(1).join(" ") ?? "",
        },
        email_address: user.email ?? undefined,
      },
      application_context: {
        brand_name: "PPT AI",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${response.status} - ${error}`);
  }

  const subscription = await response.json();

  const approvalLink = subscription.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  );

  if (!approvalLink) {
    throw new Error("Approval URL not found in subscription response");
  }

  return {
    subscriptionId: subscription.id,
    approvalUrl: approvalLink.href,
  };
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscription | null> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  // Convert snake_case to camelCase for our types
  return {
    id: data.id,
    status: data.status,
    planId: data.plan_id,
    subscriber: {
      payerId: data.subscriber?.payer_id,
      emailAddress: data.subscriber?.email_address,
    },
    billingInfo: data.billing_info
      ? {
          outstandingBalance: data.billing_info.outstanding_balance,
          cycleExecutions: data.billing_info.cycle_executions?.map((cycle: any) => ({
            tenureType: cycle.tenure_type,
            sequence: cycle.sequence,
            cyclesCompleted: cycle.cycles_completed,
            cyclesRemaining: cycle.cycles_remaining,
          })),
          lastPayment: data.billing_info.last_payment
            ? {
                amount: data.billing_info.last_payment.amount,
                time: data.billing_info.last_payment.time,
              }
            : undefined,
          nextBillingTime: data.billing_info.next_billing_time,
        }
      : undefined,
    createTime: data.create_time,
    updateTime: data.update_time,
  };
}

/**
 * Activate a PayPal subscription (after user approval)
 */
export async function activatePayPalSubscription(
  subscriptionId: string,
): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/activate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: "User approved subscription",
      }),
    }
  );

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`Failed to activate subscription: ${response.status} - ${error}`);
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string,
): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: reason ?? "User requested cancellation",
      }),
    }
  );

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`Failed to cancel subscription: ${response.status} - ${error}`);
  }
}

/**
 * Update subscription in database from PayPal data
 */
export async function syncSubscriptionFromPayPal(
  userId: string,
  paypalSubscription: PayPalSubscription,
): Promise<void> {
  const plan = await db.subscriptionPlan.findFirst({
    where: {
      OR: [
        { paypalPlanIdMonthly: paypalSubscription.planId },
        { paypalPlanIdYearly: paypalSubscription.planId },
      ],
    },
  });

  if (!plan) {
    throw new Error("Plan not found for PayPal subscription");
  }

  const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL"> = {
    ACTIVE: "ACTIVE",
    APPROVED: "ACTIVE",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
    SUSPENDED: "CANCELLED",
  };

  // Determine billing cycle based on plan
  const billingCycle = plan.paypalPlanIdMonthly === paypalSubscription.planId ? "MONTHLY" : "YEARLY";

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: statusMap[paypalSubscription.status] ?? "TRIAL",
      billingCycle,
      paypalSubscriptionId: paypalSubscription.id,
      paypalPayerId: paypalSubscription.subscriber.payerId,
      currentPeriodStart: new Date(paypalSubscription.createTime),
      currentPeriodEnd: paypalSubscription.billingInfo?.nextBillingTime
        ? new Date(paypalSubscription.billingInfo.nextBillingTime)
        : null,
    },
    update: {
      status: statusMap[paypalSubscription.status] ?? "ACTIVE",
      billingCycle,
      paypalSubscriptionId: paypalSubscription.id,
      paypalPayerId: paypalSubscription.subscriber.payerId,
      currentPeriodStart: new Date(paypalSubscription.createTime),
      currentPeriodEnd: paypalSubscription.billingInfo?.nextBillingTime
        ? new Date(paypalSubscription.billingInfo.nextBillingTime)
        : null,
    },
  });
}
