import { db } from "../src/server/db";

async function main() {
  console.log("Checking existing subscription plans...\n");

  const plans = await db.subscriptionPlan.findMany({
    orderBy: { name: "asc" },
  });

  if (plans.length === 0) {
    console.log("❌ No subscription plans found in database!");
    console.log("\nYou need to create subscription plans first.");
    console.log("Run the seed script or create plans manually.\n");
    return;
  }

  console.log(`Found ${plans.length} plan(s):\n`);

  plans.forEach((plan) => {
    console.log(`${plan.displayName} (${plan.name}):`);
    console.log(`  ID: ${plan.id}`);
    console.log(`  Monthly Price: $${plan.priceMonthly}`);
    console.log(`  Yearly Price: $${plan.priceYearly ?? "N/A"}`);
    console.log(`  PayPal Monthly Plan ID: ${plan.paypalPlanIdMonthly ?? "Not set"}`);
    console.log(`  PayPal Yearly Plan ID: ${plan.paypalPlanIdYearly ?? "Not set"}`);
    console.log(`  Active: ${plan.isActive}`);
    console.log();
  });

  const needsPayPal = plans.filter(
    (p) => !p.paypalPlanIdMonthly || !p.paypalPlanIdYearly
  );

  if (needsPayPal.length > 0) {
    console.log(`\n⚠️  ${needsPayPal.length} plan(s) need PayPal billing plans created.`);
    console.log("Run: pnpm tsx scripts/create-paypal-plans.ts\n");
  } else {
    console.log("✅ All plans have PayPal billing plans configured!\n");
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
