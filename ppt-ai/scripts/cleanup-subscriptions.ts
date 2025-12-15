import { db } from "../src/server/db";

async function main() {
  console.log("🗑️  Cleaning up subscription and payment data...\n");

  try {
    // Count before deletion
    const paymentCount = await db.payment.count();
    const subscriptionCount = await db.subscription.count();
    const usageCount = await db.usage.count();

    console.log("Current database state:");
    console.log(`  - Payments: ${paymentCount}`);
    console.log(`  - Subscriptions: ${subscriptionCount}`);
    console.log(`  - Usage records: ${usageCount}\n`);

    if (paymentCount === 0 && subscriptionCount === 0 && usageCount === 0) {
      console.log("✅ Database is already clean! No data to delete.\n");
      return;
    }

    // Delete in order (respecting foreign key constraints)
    console.log("Deleting data...");

    // 1. Delete payments first (references subscriptions)
    if (paymentCount > 0) {
      await db.payment.deleteMany({});
      console.log(`  ✓ Deleted ${paymentCount} payment(s)`);
    }

    // 2. Delete usage records (references subscriptions)
    if (usageCount > 0) {
      await db.usage.deleteMany({});
      console.log(`  ✓ Deleted ${usageCount} usage record(s)`);
    }

    // 3. Delete subscriptions
    if (subscriptionCount > 0) {
      await db.subscription.deleteMany({});
      console.log(`  ✓ Deleted ${subscriptionCount} subscription(s)`);
    }

    console.log("\n✅ Database cleanup complete!");
    console.log("\nPreserved data:");
    const userCount = await db.user.count();
    const planCount = await db.subscriptionPlan.count();
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Subscription Plans: ${planCount} (with PayPal IDs intact)`);

    console.log("\n🎯 Database is ready for fresh testing!\n");

    // Show plan details
    const plans = await db.subscriptionPlan.findMany({
      where: { paypalPlanIdMonthly: { not: null } },
      select: {
        name: true,
        displayName: true,
        paypalPlanIdMonthly: true,
        paypalPlanIdYearly: true,
      },
    });

    if (plans.length > 0) {
      console.log("Available plans for testing:");
      plans.forEach((plan) => {
        console.log(`  - ${plan.displayName} (${plan.name})`);
      });
      console.log();
    }
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
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
