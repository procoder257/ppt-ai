import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { env } from "@/env";

/**
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function client(): checkoutNodeJssdk.core.PayPalHttpClient {
  const environment =
    env.PAYPAL_MODE === "live"
      ? new checkoutNodeJssdk.core.LiveEnvironment(
        env.PAYPAL_CLIENT_ID,
        env.PAYPAL_CLIENT_SECRET,
      )
      : new checkoutNodeJssdk.core.SandboxEnvironment(
        env.PAYPAL_CLIENT_ID,
        env.PAYPAL_CLIENT_SECRET,
      );

  return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

/**
 * Use this function to get PayPal client instance
 */
export function getPayPalClient(): checkoutNodeJssdk.core.PayPalHttpClient {
  return client();
}

/**
 * Get PayPal base URL based on mode
 */
export function getPayPalBaseUrl(): string {
  return env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";
}

/**
 * Get Access Token from PayPal
 */
export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a Product
 */
export async function createProduct(product: {
  name: string;
  description: string;
  type: "SERVICE" | "PHYSICAL" | "DIGITAL";
  category: "SOFTWARE";
}) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(product),
  });

  return await response.json();
}

/**
 * Create a Plan
 */
export async function createPlan(plan: {
  productId: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  intervalUnit: "MONTH" | "YEAR";
  intervalCount: number;
}) {
  const accessToken = await getAccessToken();

  const payload = {
    product_id: plan.productId,
    name: plan.name,
    description: plan.description,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: {
          interval_unit: plan.intervalUnit,
          interval_count: plan.intervalCount,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: plan.price,
            currency_code: plan.currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "0",
        currency_code: plan.currency,
      },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  };

  const response = await fetch(`${getPayPalBaseUrl()}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}
