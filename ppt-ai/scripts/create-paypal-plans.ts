import { createPayPalPlan } from "../src/server/paypal/products";
import { db } from "../src/server/db";

async function main() {
  console.log("Creating PayPal plans...\n");

  try {
    // Get existing plans from database (only PRO plan needs PayPal billing)
    const plans = await db.subscriptionPlan.findMany({
      where: {
        name: "PRO",
        priceMonthly: { gt: 0 }, // Only plans with pricing
      },
    });

    console.log(`Found ${plans.length} plans in database\n`);

    for (const plan of plans) {
      console.log(`Creating PayPal billing plans for: ${plan.displayName}`);
      console.log(`  Monthly Price: $${plan.priceMonthly}`);
      console.log(`  Yearly Price: $${plan.priceYearly}`);

      // Skip if PayPal plans already exist
      if (plan.paypalPlanIdMonthly && plan.paypalPlanIdYearly) {
        console.log(`  ✓ PayPal plans already exist for ${plan.displayName}`);
        console.log(`    Monthly Plan ID: ${plan.paypalPlanIdMonthly}`);
        console.log(`    Yearly Plan ID: ${plan.paypalPlanIdYearly}\n`);
        continue;
      }

      // Create PayPal plans
      const { monthlyPlanId, yearlyPlanId } = await createPayPalPlan(
        `PPT AI ${plan.displayName} Plan`,
        plan.description ?? `${plan.displayName} subscription plan for PPT AI`,
        plan.priceMonthly,
        plan.priceYearly ?? plan.priceMonthly * 10,
      );

      // Update database with PayPal plan IDs
      await db.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
          paypalPlanIdMonthly: monthlyPlanId,
          paypalPlanIdYearly: yearlyPlanId,
        },
      });

      console.log(`  ✓ Created PayPal plans successfully!`);
      console.log(`    Monthly Plan ID: ${monthlyPlanId}`);
      console.log(`    Yearly Plan ID: ${yearlyPlanId}\n`);
    }

    console.log("\n✅ All PayPal plans created and saved to database!");

    // Display summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY - PayPal Plan IDs");
    console.log("=".repeat(60));

    const updatedPlans = await db.subscriptionPlan.findMany({
      where: {
        paypalPlanIdMonthly: { not: null },
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        paypalPlanIdMonthly: true,
        paypalPlanIdYearly: true,
      },
    });

    updatedPlans.forEach((plan) => {
      console.log(`\n${plan.displayName} (${plan.name}):`);
      console.log(`  Database ID: ${plan.id}`);
      console.log(`  Monthly Plan: ${plan.paypalPlanIdMonthly}`);
      console.log(`  Yearly Plan: ${plan.paypalPlanIdYearly}`);
    });

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error creating PayPal plans:", error);
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
