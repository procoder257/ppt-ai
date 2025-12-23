
import { getAccessToken, createProduct, createPlan } from "../src/server/paypal/client";

async function main() {
  try {
    console.log("Creating PayPal Product and Plans...");

    // 1. Create Product
    const product = await createProduct({
      name: "PPT AI Subscription",
      description: "Subscription to PPT AI presentation tools",
      type: "SERVICE",
      category: "SOFTWARE"
    });

    console.log(`✅ Product Created: ${product.id}`);

    // 2. Create Plans

    // Starter Monthly ($25)
    const starterMonthly = await createPlan({
      productId: product.id,
      name: "PPT AI Starter Monthly",
      description: "Starter Plan - Monthly Billing",
      price: "25",
      intervalUnit: "MONTH",
      intervalCount: 1,
      currency: "USD"
    });
    console.log(`✅ Starter Monthly Plan ID: ${starterMonthly.id}`);

    // Starter Annual ($240/yr = $20/mo)
    const starterYearly = await createPlan({
      productId: product.id,
      name: "PPT AI Starter Annual",
      description: "Starter Plan - Annual Billing",
      price: "240",
      intervalUnit: "YEAR",
      intervalCount: 1,
      currency: "USD"
    });
    console.log(`✅ Starter Annual Plan ID: ${starterYearly.id}`);

    // Pro Monthly ($35)
    const proMonthly = await createPlan({
      productId: product.id,
      name: "PPT AI Pro Monthly",
      description: "Pro Plan - Monthly Billing",
      price: "35",
      intervalUnit: "MONTH",
      intervalCount: 1,
      currency: "USD"
    });
    console.log(`✅ Pro Monthly Plan ID: ${proMonthly.id}`);

    // Pro Annual ($360/yr = $30/mo)
    const proYearly = await createPlan({
      productId: product.id,
      name: "PPT AI Pro Annual",
      description: "Pro Plan - Annual Billing",
      price: "360",
      intervalUnit: "YEAR",
      intervalCount: 1,
      currency: "USD"
    });
    console.log(`✅ Pro Annual Plan ID: ${proYearly.id}`);

    console.log("\n--- COPY THESE IDS ---");
    console.log(`STARTER_MONTHLY="${starterMonthly.id}"`);
    console.log(`STARTER_YEARLY="${starterYearly.id}"`);
    console.log(`PRO_MONTHLY="${proMonthly.id}"`);
    console.log(`PRO_YEARLY="${proYearly.id}"`);
    console.log("----------------------\n");

  } catch (error) {
    console.error("Error creating plans:", error);
  }
}

main();
