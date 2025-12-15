import { db } from "../src/server/db";

async function main() {
  console.log("📊 Database State Summary\n");
  console.log("=".repeat(60));

  // Count all relevant tables
  const users = await db.user.count();
  const subscriptions = await db.subscription.count();
  const payments = await db.payment.count();
  const usage = await db.usage.count();
  const plans = await db.subscriptionPlan.count();

  console.log("\nTable Counts:");
  console.log(`  Users:               ${users}`);
  console.log(`  Subscriptions:       ${subscriptions}`);
  console.log(`  Payments:            ${payments}`);
  console.log(`  Usage Records:       ${usage}`);
  console.log(`  Subscription Plans:  ${plans}`);

  // Show PayPal configured plans
  const paypalPlans = await db.subscriptionPlan.findMany({
    where: {
      paypalPlanIdMonthly: { not: null },
    },
    select: {
      name: true,
      displayName: true,
      priceMonthly: true,
      priceYearly: true,
      paypalPlanIdMonthly: true,
      paypalPlanIdYearly: true,
    },
  });

  console.log("\n" + "=".repeat(60));
  console.log("PayPal Configured Plans:");
  console.log("=".repeat(60));

  if (paypalPlans.length === 0) {
    console.log("\n❌ No plans configured with PayPal yet!");
    console.log("   Run: node --env-file=.env --import=tsx/esm scripts/create-paypal-plans.ts\n");
  } else {
    paypalPlans.forEach((plan) => {
      console.log(`\n${plan.displayName} (${plan.name}):`);
      console.log(`  Monthly: $${plan.priceMonthly} → ${plan.paypalPlanIdMonthly}`);
      console.log(`  Yearly:  $${plan.priceYearly} → ${plan.paypalPlanIdYearly}`);
    });
  }

  // Show any active subscriptions
  if (subscriptions > 0) {
    console.log("\n" + "=".repeat(60));
    console.log("Active Subscriptions:");
    console.log("=".repeat(60));

    const activeSubscriptions = await db.subscription.findMany({
      include: {
        user: { select: { email: true, name: true } },
        plan: { select: { displayName: true } },
      },
    });

    activeSubscriptions.forEach((sub) => {
      console.log(`\n${sub.user.email ?? sub.user.name}:`);
      console.log(`  Plan: ${sub.plan.displayName}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Billing: ${sub.billingCycle ?? "N/A"}`);
      console.log(`  PayPal Sub ID: ${sub.paypalSubscriptionId ?? "N/A"}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Database state check complete!\n");

  if (subscriptions === 0 && payments === 0) {
    console.log("🎯 Ready for testing! No active subscriptions or payments.\n");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
