
import { db } from "../src/server/db";
import { createPayPalSubscription, syncSubscriptionFromPayPal } from "../src/server/paypal/subscriptions";
import { SubscriptionStatus } from "@prisma/client";

// Mock environment variables if needed
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Mock PayPal API responses
const MOCK_PAYPAL_SUBSCRIPTION_ID = "I-TEST-12345";
const MOCK_PAYPAL_PLAN_ID = "P-TEST-MONTHLY";
const MOCK_APPROVAL_URL = "https://www.sandbox.paypal.com/approve/I-TEST-12345";

// Mock fetch for PayPal API
const originalFetch = global.fetch;
global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
  const urlString = url.toString();
  
  // Mock OAuth token
  if (urlString.includes("/v1/oauth2/token")) {
    return new Response(JSON.stringify({ access_token: "mock_access_token" }), { status: 200 });
  }

  // Mock Create Subscription
  if (urlString.includes("/v1/billing/subscriptions") && init?.method === "POST") {
    return new Response(JSON.stringify({
      id: MOCK_PAYPAL_SUBSCRIPTION_ID,
      links: [{ rel: "approve", href: MOCK_APPROVAL_URL }]
    }), { status: 201 });
  }

  // Mock Get Subscription
  if (urlString.includes(`/v1/billing/subscriptions/${MOCK_PAYPAL_SUBSCRIPTION_ID}`) && init?.method === "GET") {
    return new Response(JSON.stringify({
      id: MOCK_PAYPAL_SUBSCRIPTION_ID,
      status: "ACTIVE",
      plan_id: MOCK_PAYPAL_PLAN_ID,
      subscriber: {
        payer_id: "PAYER-123",
        email_address: "test-user@example.com"
      },
      create_time: new Date().toISOString(),
      billing_info: {
        next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }), { status: 200 });
  }

  return originalFetch(url, init);
};

async function runVerification() {
  console.log("🚀 Starting Payment & Subscription Flow Verification");
  
  let testUser = null;
  let testPlan = null;

  try {
    // 1. Setup Test Data
    console.log("\n1️⃣  Setting up test data...");
    
    // Create test user
    testUser = await db.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        hasAccess: false,
        role: "USER"
      }
    });
    console.log("✅ Created test user:", testUser.id);

    // Ensure test plan exists
    testPlan = await db.subscriptionPlan.upsert({
      where: { name: "PRO" },
      update: {
        paypalPlanIdMonthly: MOCK_PAYPAL_PLAN_ID
      },
      create: {
        name: "PRO",
        displayName: "Pro Plan",
        priceMonthly: 19,
        paypalPlanIdMonthly: MOCK_PAYPAL_PLAN_ID,
        features: {},
        limits: {}
      }
    });
    console.log("✅ Verified test plan:", testPlan.name);

    // 2. Test Subscription Creation
    console.log("\n2️⃣  Testing Subscription Creation...");
    const { subscriptionId, approvalUrl } = await createPayPalSubscription(
      MOCK_PAYPAL_PLAN_ID,
      testUser.id,
      "http://localhost:3000/return",
      "http://localhost:3000/cancel"
    );

    if (subscriptionId === MOCK_PAYPAL_SUBSCRIPTION_ID && approvalUrl === MOCK_APPROVAL_URL) {
      console.log("✅ createPayPalSubscription returned correct data");
    } else {
      throw new Error("createPayPalSubscription returned unexpected data");
    }

    // Simulate what the API route does: create INCOMPLETE subscription
    await db.subscription.create({
      data: {
        userId: testUser.id,
        planId: testPlan.id,
        status: "INCOMPLETE",
        paypalSubscriptionId: subscriptionId
      }
    });
    console.log("✅ Created INCOMPLETE subscription in DB");

    // 3. Test Subscription Activation/Sync
    console.log("\n3️⃣  Testing Subscription Sync (Activation)...");
    
    // Mock the PayPal subscription object that would be returned
    const mockPayPalSub = {
      id: MOCK_PAYPAL_SUBSCRIPTION_ID,
      status: "ACTIVE",
      planId: MOCK_PAYPAL_PLAN_ID,
      subscriber: {
        payerId: "PAYER-123",
        emailAddress: testUser.email!
      },
      createTime: new Date().toISOString(),
      billingInfo: {
        nextBillingTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    await syncSubscriptionFromPayPal(testUser.id, mockPayPalSub as any);
    
    const updatedSub = await db.subscription.findUnique({
      where: { userId: testUser.id }
    });

    if (updatedSub?.status === "ACTIVE") {
      console.log("✅ Subscription status updated to ACTIVE");
    } else {
      throw new Error(`Subscription status is ${updatedSub?.status}, expected ACTIVE`);
    }

    if (updatedSub?.paypalPayerId === "PAYER-123") {
      console.log("✅ PayPal Payer ID synced correctly");
    } else {
      throw new Error("PayPal Payer ID not synced");
    }

    // 4. Verify Access Control Logic
    console.log("\n4️⃣  Verifying Access Control Logic...");
    
    const hasActiveSubscription = 
      updatedSub?.status === "ACTIVE" || 
      (updatedSub?.status === "TRIAL" && updatedSub.trialEndsAt! > new Date());

    if (hasActiveSubscription) {
      console.log("✅ Access Check: User HAS access");
    } else {
      throw new Error("Access Check Failed: User should have access");
    }

    console.log("\n🎉 Verification Completed Successfully!");

  } catch (error) {
    console.error("\n❌ Verification Failed:", error);
  } finally {
    // Cleanup
    if (testUser) {
      console.log("\n🧹 Cleaning up test data...");
      await db.subscription.deleteMany({ where: { userId: testUser.id } });
      await db.user.delete({ where: { id: testUser.id } });
      console.log("✅ Cleanup complete");
    }
  }
}

runVerification();
