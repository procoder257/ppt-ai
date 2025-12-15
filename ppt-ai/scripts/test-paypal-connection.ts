import { env } from "../src/env";

async function testPayPalConnection() {
  console.log("Testing PayPal API connection...\n");

  try {
    // Check environment variables
    console.log("Environment Variables:");
    console.log(`  PAYPAL_MODE: ${env.PAYPAL_MODE}`);
    console.log(`  PAYPAL_CLIENT_ID: ${env.PAYPAL_CLIENT_ID ? "Set ✓" : "Missing ✗"}`);
    console.log(`  PAYPAL_CLIENT_SECRET: ${env.PAYPAL_CLIENT_SECRET ? "Set ✓" : "Missing ✗"}`);
    console.log(`  NEXTAUTH_URL: ${env.NEXTAUTH_URL}\n`);

    // Get access token
    const baseUrl =
      env.PAYPAL_MODE === "live"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com";

    const auth = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    console.log("Requesting PayPal access token...");
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Failed to get access token");
      console.error("Status:", tokenResponse.status);
      console.error("Response:", errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Access token received successfully\n");

    // Test getting a billing plan
    console.log("Testing billing plan retrieval...");
    const planId = "P-2XN18569N6536591MNE7NNFY"; // Your monthly plan ID

    const planResponse = await fetch(`${baseUrl}/v1/billing/plans/${planId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      console.error("❌ Failed to get billing plan");
      console.error("Status:", planResponse.status);
      console.error("Response:", errorText);
      return;
    }

    const plan = await planResponse.json();
    console.log("✅ Billing plan retrieved successfully");
    console.log(`  Plan Name: ${plan.name}`);
    console.log(`  Plan Status: ${plan.status}\n`);

    console.log("🎉 All PayPal API tests passed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

testPayPalConnection();
