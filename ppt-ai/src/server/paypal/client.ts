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
