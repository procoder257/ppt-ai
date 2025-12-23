import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { createPayPalSubscription } from "@/server/paypal/subscriptions";
import { db } from "@/server/db";
import { env } from "@/env";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    console.log("Session data:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName, billingCycle } = await request.json();

    if (!planName || !billingCycle) {
      return NextResponse.json(
        { error: "Plan Name and billing cycle are required" },
        { status: 400 },
      );
    }

    const plan = await db.subscriptionPlan.findUnique({
      where: { name: planName },
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
    console.error("PayPal checkout error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 },
    );
  }
}
