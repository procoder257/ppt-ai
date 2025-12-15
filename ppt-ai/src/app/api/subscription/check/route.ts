import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        paypalSubscriptionId: true,
      },
    });

    // Check if user has active subscription or valid trial
    const hasActiveSubscription =
      subscription?.status === "ACTIVE" ||
      (subscription?.status === "TRIAL" &&
        subscription.trialEndsAt &&
        subscription.trialEndsAt > new Date());

    return NextResponse.json({
      hasActiveSubscription,
      subscription: subscription
        ? {
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt,
            currentPeriodEnd: subscription.currentPeriodEnd,
            paypalSubscriptionId: subscription.paypalSubscriptionId,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Failed to check subscription", hasActiveSubscription: false },
      { status: 500 },
    );
  }
}
