import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  getPayPalSubscription,
  activatePayPalSubscription,
  syncSubscriptionFromPayPal,
} from "@/server/paypal/subscriptions";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = (await request.json().catch(() => ({}))) as {
      subscriptionId?: unknown;
    };

    if (typeof subscriptionId !== "string" || !subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    // Only activate a PayPal subscription that checkout created for this user.
    // Otherwise anyone could attach another customer's paid subscription
    // to their own account by posting its ID.
    const ownedSubscription = await db.subscription.findFirst({
      where: { userId: session.user.id, paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    if (!ownedSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Get subscription from PayPal
    const paypalSubscription = await getPayPalSubscription(subscriptionId);

    if (!paypalSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Activate subscription if needed
    if (paypalSubscription.status === "APPROVED") {
      await activatePayPalSubscription(subscriptionId);
    }

    // Sync to database
    await syncSubscriptionFromPayPal(session.user.id, paypalSubscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate subscription" },
      { status: 500 },
    );
  }
}
