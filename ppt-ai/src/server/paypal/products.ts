import { getPayPalBaseUrl } from "./client";
import type { PayPalPlan } from "./types";
import { env } from "@/env";

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal billing plan for a subscription
 */
export async function createPayPalPlan(
  name: string,
  description: string,
  monthlyPrice: number,
  yearlyPrice: number,
): Promise<{ monthlyPlanId: string; yearlyPlanId: string }> {
  const accessToken = await getAccessToken();
  const productId = await getOrCreateProduct(accessToken);

  // Create monthly plan
  const monthlyPlan = await createPlan(
    accessToken,
    productId,
    `${name} - Monthly`,
    description,
    monthlyPrice,
    "MONTH"
  );

  // Create yearly plan
  const yearlyPlan = await createPlan(
    accessToken,
    productId,
    `${name} - Yearly`,
    description,
    yearlyPrice,
    "YEAR"
  );

  return {
    monthlyPlanId: monthlyPlan.id,
    yearlyPlanId: yearlyPlan.id,
  };
}

/**
 * Create a single billing plan
 */
async function createPlan(
  accessToken: string,
  productId: string,
  name: string,
  description: string,
  price: number,
  interval: "MONTH" | "YEAR"
): Promise<{ id: string }> {
  const response = await fetch(`${getPayPalBaseUrl()}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = infinite
          pricing_scheme: {
            fixed_price: {
              value: price.toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal plan: ${response.status} - ${error}`);
  }

  const plan = await response.json();
  return { id: plan.id };
}

/**
 * Get or create PayPal product
 */
async function getOrCreateProduct(accessToken: string): Promise<string> {
  // Check if product ID is in environment
  const productId = process.env.PAYPAL_PRODUCT_ID;
  if (productId) {
    return productId;
  }

  // Create a new product
  const response = await fetch(`${getPayPalBaseUrl()}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "PPT AI Subscription",
      description: "Subscription plans for PPT AI",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal product: ${response.status} - ${error}`);
  }

  const product = await response.json();
  console.log(`\nℹ️  Created PayPal Product ID: ${product.id}`);
  console.log("   Add this to your .env file: PAYPAL_PRODUCT_ID=" + product.id + "\n");

  return product.id;
}

/**
 * Get plan details from PayPal
 */
export async function getPayPalPlan(planId: string): Promise<PayPalPlan | null> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v1/billing/plans/${planId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}
