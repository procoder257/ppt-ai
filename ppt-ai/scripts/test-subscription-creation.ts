import { db } from "../src/server/db";
import { createPayPalSubscription } from "../src/server/paypal/subscriptions";
import { env } from "../src/env";

async function testSubscriptionCreation() {
  console.log("Testing PayPal subscription creation...\n");

  try {
    // Get a test user
    const user = await db.user.findFirst();

    if (!user) {
      console.error("❌ No users found in database. Please sign in first.");
      return;
    }

    console.log(`Using test user: ${user.email}\n`);

    // Get the Pro plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { name: "PRO" },
    });

    if (!plan || !plan.paypalPlanIdMonthly) {
      console.error("❌ Pro plan or PayPal plan ID not found");
      return;
    }

    console.log(`Plan: ${plan.displayName}`);
    console.log(`PayPal Plan ID: ${plan.paypalPlanIdMonthly}\n`);

    // Create subscription
    const baseUrl = env.NEXTAUTH_URL;
    // PayPal will automatically append subscription_id as a query parameter
    const returnUrl = `${baseUrl}/pricing/success`;
    const cancelUrl = `${baseUrl}/pricing/cancel`;

    console.log("Creating PayPal subscription...");
    console.log(`Return URL: ${returnUrl}`);
    console.log(`Cancel URL: ${cancelUrl}\n`);

    const result = await createPayPalSubscription(
      plan.paypalPlanIdMonthly,
      user.id,
      returnUrl,
      cancelUrl
    );

    console.log("✅ Subscription created successfully!");
    console.log(`  Subscription ID: ${result.subscriptionId}`);
    console.log(`  Approval URL: ${result.approvalUrl}\n`);

    console.log("🎉 Test passed! The subscription creation flow works.");
    console.log("\nYou can approve this subscription by visiting:");
    console.log(result.approvalUrl);

  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error);
    if (error instanceof Error) {
      console.error("\nError details:");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  } finally {
    await db.$disconnect();
  }
}

testSubscriptionCreation();
