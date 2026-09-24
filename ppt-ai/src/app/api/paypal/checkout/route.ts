import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { createPayPalSubscription } from "@/server/paypal/subscriptions";
import { db } from "@/server/db";
import { env } from "@/env";
import { SubscriptionPlanName } from "@prisma/client";

const VALID_PLAN_NAMES = new Set<string>(Object.values(SubscriptionPlanName));

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName, billingCycle } = (await request.json().catch(() => ({}))) as {
      planName?: unknown;
      billingCycle?: unknown;
    };

    if (
      typeof planName !== "string" ||
      !VALID_PLAN_NAMES.has(planName) ||
      (billingCycle !== "MONTHLY" && billingCycle !== "YEARLY")
    ) {
      return NextResponse.json(
        { error: "A valid plan name and billing cycle (MONTHLY or YEARLY) are required" },
        { status: 400 },
      );
    }

    const plan = await db.subscriptionPlan.findUnique({
      where: { name: planName as SubscriptionPlanName },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const paypalPlanId =
      billingCycle === "MONTHLY"
        ? plan.paypalPlanIdMonthly
        : plan.paypalPlanIdYearly;

    if (!paypalPlanId) {
      return NextResponse.json(
        { error: "PayPal plan not configured" },
        { status: 400 },
      );
    }

    const baseUrl = env.NEXTAUTH_URL;
    // PayPal will automatically append subscription_id as a query parameter
    const returnUrl = `${baseUrl}/pricing/success`;
    const cancelUrl = `${baseUrl}/pricing/cancel`;

    const { subscriptionId, approvalUrl } = await createPayPalSubscription(
      paypalPlanId,
      session.user.id,
      returnUrl,
      cancelUrl,
    );

    // Store subscription ID temporarily (you might want to use Redis or database)
    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: plan.id,
        status: "INCOMPLETE",
        paypalSubscriptionId: subscriptionId,
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        status: "INCOMPLETE",
      },
    });

    return NextResponse.json({
      subscriptionId,
      approvalUrl,
    });
  } catch (error) {
    // Log details server-side only; never send stack traces to the client.
    console.error("PayPal checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
