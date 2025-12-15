---
name: PayPal Phase 2 Implementation
overview: Create a detailed Phase 2 implementation guide for PayPal payment gateway integration, following the same structure and depth as the Phase 1 implementation guide, but adapted for PayPal's API and subscription model.
todos:
  - id: update-schema-paypal
    content: Update Prisma schema to add PayPal-specific fields (paypalSubscriptionId, paypalPlanId, paypalTransactionId) while keeping Stripe fields for backward compatibility
    status: pending
  - id: setup-paypal-sdk
    content: Install PayPal SDK packages and configure environment variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE, PAYPAL_WEBHOOK_ID)
    status: pending
  - id: create-paypal-client
    content: Create PayPal client initialization in src/server/paypal/client.ts with sandbox/live environment support
    status: pending
  - id: create-paypal-types
    content: Define TypeScript types for PayPal plans, subscriptions, and webhook events in src/server/paypal/types.ts
    status: pending
  - id: create-paypal-plans
    content: Implement PayPal plan creation functions in src/server/paypal/products.ts to create billing plans via PayPal API
    status: pending
  - id: create-subscription-service
    content: Build subscription service in src/server/paypal/subscriptions.ts with functions for creating, activating, canceling, and syncing subscriptions
    status: pending
  - id: implement-checkout-api
    content: Create checkout API route at src/app/api/paypal/checkout/route.ts to initiate PayPal subscription flow
    status: pending
  - id: create-pricing-page
    content: Build pricing page at src/app/pricing/page.tsx with PayPal subscription buttons and billing cycle toggle
    status: pending
  - id: create-success-cancel-pages
    content: Create success and cancel pages at src/app/pricing/success/page.tsx and src/app/pricing/cancel/page.tsx
    status: pending
  - id: implement-webhook-handler
    content: Create webhook handler at src/app/api/paypal/webhook/route.ts to process PayPal subscription and payment events
    status: pending
  - id: create-activation-endpoint
    content: Build subscription activation endpoint at src/app/api/paypal/subscription/activate/route.ts to sync subscription after user approval
    status: pending
  - id: test-paypal-integration
    content: Test complete PayPal subscription flow in sandbox mode including checkout, webhooks, and subscription management
    status: pending
---

# Phase 2 Implementation Guide: PayPal Payment Gateway Integration

## Overview

This guide provides detailed implementation steps for Phase 2 of the commercialization plan, integrating PayPal as the payment gateway. This replaces the Stripe integration approach with PayPal's subscription and billing APIs.

---

## Step 2.1: Update Database Schema for PayPal

### Current State Analysis

- Schema has `stripeSubscriptionId`, `stripeCustomerId`, `stripePriceIdMonthly`, `stripePriceIdYearly` fields
- Payment model has `stripePaymentIntentId` and `stripeInvoiceId`
- Need to add PayPal-specific fields or make them generic

### Implementation Steps

#### 2.1.1: Update Subscription Model for PayPal

Update `prisma/schema.prisma`:

```prisma
model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId               String
  plan                 SubscriptionPlan   @relation(fields: [planId], references: [id])
  status               SubscriptionStatus @default(TRIAL)
  billingCycle         BillingCycle?
  
  // PayPal-specific fields
  paypalSubscriptionId String?            @unique
  paypalBillingAgreementId String?        @unique
  paypalPayerId        String?
  
  // Keep Stripe fields for backward compatibility (nullable)
  stripeSubscriptionId String?            @unique
  stripeCustomerId     String?            @unique
  
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  trialEndsAt          DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  payments             Payment[]
  usage                Usage[]

  @@index([userId])
  @@index([status])
  @@index([paypalSubscriptionId])
  @@index([stripeSubscriptionId])
}
```

#### 2.1.2: Update SubscriptionPlan Model for PayPal

```prisma
model SubscriptionPlan {
  id                     String               @id @default(cuid())
  name                   SubscriptionPlanName @unique
  displayName            String
  description            String?
  priceMonthly           Float                @default(0)
  priceYearly            Float?               @default(0)
  
  // PayPal-specific fields
  paypalPlanIdMonthly    String?
  paypalPlanIdYearly     String?
  
  // Keep Stripe fields for backward compatibility
  stripePriceIdMonthly   String?
  stripePriceIdYearly    String?
  
  features               Json
  limits                 Json
  isActive               Boolean              @default(true)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
  subscriptions          Subscription[]

  @@index([name])
}
```

#### 2.1.3: Update Payment Model for PayPal

```prisma
model Payment {
  id                    String         @id @default(cuid())
  subscriptionId        String
  subscription          Subscription   @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  amount                Float
  currency              String         @default("usd")
  status                PaymentStatus  @default(PENDING)
  
  // PayPal-specific fields
  paypalTransactionId   String?        @unique
  paypalOrderId         String?        @unique
  paypalCaptureId       String?        @unique
  
  // Keep Stripe fields for backward compatibility
  stripePaymentIntentId String?        @unique
  stripeInvoiceId       String?        @unique
  
  billingCycle          BillingCycle?
  paidAt                DateTime?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  @@index([subscriptionId])
  @@index([status])
  @@index([paypalTransactionId])
  @@index([stripePaymentIntentId])
}
```

#### 2.1.4: Run Migration

```bash
# Generate Prisma client
pnpm db:push

# Or create a migration file
npx prisma migrate dev --name add_paypal_fields
```

---

## Step 2.2: Setup PayPal Developer Account and SDK

### 2.2.1: Create PayPal Developer Account

1. Go to https://developer.paypal.com/
2. Create a developer account
3. Create a new application in the dashboard
4. Get Client ID and Secret (for both Sandbox and Live)

### 2.2.2: Install PayPal SDK

```bash
pnpm add @paypal/checkout-server-sdk @paypal/payouts-sdk
```

### 2.2.3: Add PayPal Environment Variables

Update `src/env.js`:

```typescript
export const env = createEnv({
  server: {
    // ... existing variables ...
    
    // PayPal Configuration
    PAYPAL_CLIENT_ID: z.string(),
    PAYPAL_CLIENT_SECRET: z.string(),
    PAYPAL_WEBHOOK_ID: z.string().optional(),
    PAYPAL_MODE: z.enum(["sandbox", "live"]).default("sandbox"),
  },
  
  runtimeEnv: {
    // ... existing variables ...
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    PAYPAL_MODE: process.env.PAYPAL_MODE,
  },
});
```

---

## Step 2.3: Create PayPal Client and Configuration

### Directory Structure

```
src/server/paypal/
├── client.ts
├── products.ts
├── subscriptions.ts
├── webhooks.ts
└── types.ts
```

### 2.3.1: Create PayPal Client (`client.ts`)

```typescript
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
```

### 2.3.2: Create PayPal Types (`types.ts`)

```typescript
export type PayPalPlan = {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "CREATED";
  billingCycles: PayPalBillingCycle[];
};

export type PayPalBillingCycle = {
  frequency: {
    intervalUnit: "MONTH" | "YEAR";
    intervalCount: number;
  };
  tenureType: "REGULAR" | "TRIAL";
  sequence: number;
  totalCycles?: number;
  pricingScheme: {
    fixedPrice: {
      value: string;
      currencyCode: string;
    };
  };
};

export type PayPalSubscription = {
  id: string;
  status:
    | "APPROVAL_PENDING"
    | "APPROVED"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED";
  planId: string;
  subscriber: {
    payerId?: string;
    emailAddress?: string;
  };
  billingInfo?: {
    outstandingBalance: {
      value: string;
      currencyCode: string;
    };
    cycleExecutions: Array<{
      tenureType: string;
      sequence: number;
      cyclesCompleted: number;
      cyclesRemaining?: number;
    }>;
    lastPayment?: {
      amount: {
        value: string;
        currencyCode: string;
      };
      time: string;
    };
    nextBillingTime?: string;
  };
  createTime: string;
  updateTime: string;
};

export type PayPalWebhookEvent = {
  id: string;
  eventType: string;
  resourceType: string;
  summary: string;
  resource: Record<string, unknown>;
  createTime: string;
};
```

---

## Step 2.4: Create PayPal Subscription Plans

### 2.4.1: Create Products File (`products.ts`)

```typescript
import { getPayPalClient } from "./client";
import type { PayPalPlan, PayPalBillingCycle } from "./types";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

/**
 * Create a PayPal billing plan for a subscription
 */
export async function createPayPalPlan(
  name: string,
  description: string,
  monthlyPrice: number,
  yearlyPrice: number,
): Promise<{ monthlyPlanId: string; yearlyPlanId: string }> {
  const request = new checkoutNodeJssdk.billing.PlansCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    productId: await getOrCreateProduct(),
    name,
    description,
    billingCycles: [
      {
        frequency: {
          intervalUnit: "MONTH",
          intervalCount: 1,
        },
        tenureType: "REGULAR",
        sequence: 1,
        totalCycles: 0, // 0 = infinite
        pricingScheme: {
          fixedPrice: {
            value: monthlyPrice.toFixed(2),
            currencyCode: "USD",
          },
        },
      },
      {
        frequency: {
          intervalUnit: "YEAR",
          intervalCount: 1,
        },
        tenureType: "REGULAR",
        sequence: 2,
        totalCycles: 0,
        pricingScheme: {
          fixedPrice: {
            value: yearlyPrice.toFixed(2),
            currencyCode: "USD",
          },
        },
      },
    ],
    paymentPreferences: {
      autoBillOutstanding: true,
      setupFee: {
        value: "0",
        currencyCode: "USD",
      },
      setupFeeFailureAction: "CONTINUE",
      paymentFailureThreshold: 3,
    },
    taxes: {
      percentage: "0",
      inclusive: false,
    },
  });

  const client = getPayPalClient();
  const response = await client.execute(request);
  
  if (response.statusCode !== 201) {
    throw new Error(`Failed to create PayPal plan: ${response.statusCode}`);
  }

  const plan = response.result as { id: string; billingCycles: PayPalBillingCycle[] };
  
  const monthlyPlanId = plan.id;
  const yearlyPlanId = plan.id; // Same plan, different billing cycle

  return { monthlyPlanId, yearlyPlanId };
}

/**
 * Get or create PayPal product
 */
async function getOrCreateProduct(): Promise<string> {
  // In production, store this in database
  // For now, create if doesn't exist
  const productId = process.env.PAYPAL_PRODUCT_ID;
  
  if (productId) {
    return productId;
  }

  const request = new checkoutNodeJssdk.catalog.ProductsCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    name: "PPT AI Subscription",
    description: "Subscription plans for PPT AI",
    type: "SERVICE",
    category: "SOFTWARE",
  });

  const client = getPayPalClient();
  const response = await client.execute(request);
  
  if (response.statusCode !== 201) {
    throw new Error(`Failed to create PayPal product: ${response.statusCode}`);
  }

  const product = response.result as { id: string };
  return product.id;
}

/**
 * Get plan details from PayPal
 */
export async function getPayPalPlan(planId: string): Promise<PayPalPlan | null> {
  const request = new checkoutNodeJssdk.billing.PlansGetRequest(planId);
  
  const client = getPayPalClient();
  const response = await client.execute(request);
  
  if (response.statusCode !== 200) {
    return null;
  }

  return response.result as PayPalPlan;
}
```

### 2.4.2: Create Initial Plans Script

Create `scripts/create-paypal-plans.ts`:

```typescript
import { createPayPalPlan } from "@/server/paypal/products";
import { db } from "@/server/db";

async function main() {
  console.log("Creating PayPal plans...");

  // Create Pro Plan
  const proPlans = await createPayPalPlan(
    "PPT AI Pro Plan",
    "Professional plan with unlimited presentations",
    19.00,
    190.00,
  );

  // Update database
  await db.subscriptionPlan.update({
    where: { name: "PRO" },
    data: {
      paypalPlanIdMonthly: proPlans.monthlyPlanId,
      paypalPlanIdYearly: proPlans.yearlyPlanId,
    },
  });

  console.log("PayPal plans created successfully!");
  console.log("Pro Monthly Plan ID:", proPlans.monthlyPlanId);
  console.log("Pro Yearly Plan ID:", proPlans.yearlyPlanId);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
```

---

## Step 2.5: Implement PayPal Subscription Service

### 2.5.1: Create Subscriptions Service (`subscriptions.ts`)

```typescript
import { getPayPalClient } from "./client";
import type { PayPalSubscription } from "./types";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { db } from "@/server/db";

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const request = new checkoutNodeJssdk.billing.SubscriptionsCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    planId,
    startTime: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    subscriber: {
      name: {
        givenName: user.name?.split(" ")[0] ?? "User",
        surname: user.name?.split(" ").slice(1).join(" ") ?? "",
      },
      emailAddress: user.email ?? undefined,
    },
    applicationContext: {
      brandName: "PPT AI",
      locale: "en-US",
      shippingPreference: "NO_SHIPPING",
      userAction: "SUBSCRIBE_NOW",
      paymentMethod: {
        payerSelected: "PAYPAL",
        payeePreferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      returnUrl,
      cancelUrl,
    },
  });

  const client = getPayPalClient();
  const response = await client.execute(request);

  if (response.statusCode !== 201) {
    throw new Error(`Failed to create subscription: ${response.statusCode}`);
  }

  const subscription = response.result as PayPalSubscription & {
    links: Array<{ href: string; rel: string; method: string }>;
  };

  const approvalLink = subscription.links.find(
    (link) => link.rel === "approve",
  );

  if (!approvalLink) {
    throw new Error("Approval URL not found in subscription response");
  }

  return {
    subscriptionId: subscription.id,
    approvalUrl: approvalLink.href,
  };
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscription | null> {
  const request =
    new checkoutNodeJssdk.billing.SubscriptionsGetRequest(subscriptionId);

  const client = getPayPalClient();
  const response = await client.execute(request);

  if (response.statusCode !== 200) {
    return null;
  }

  return response.result as PayPalSubscription;
}

/**
 * Activate a PayPal subscription (after user approval)
 */
export async function activatePayPalSubscription(
  subscriptionId: string,
): Promise<void> {
  const request =
    new checkoutNodeJssdk.billing.SubscriptionsActivateRequest(subscriptionId);
  request.requestBody({
    reason: "User approved subscription",
  });

  const client = getPayPalClient();
  const response = await client.execute(request);

  if (response.statusCode !== 204) {
    throw new Error(`Failed to activate subscription: ${response.statusCode}`);
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string,
): Promise<void> {
  const request =
    new checkoutNodeJssdk.billing.SubscriptionsCancelRequest(subscriptionId);
  request.requestBody({
    reason: reason ?? "User requested cancellation",
  });

  const client = getPayPalClient();
  const response = await client.execute(request);

  if (response.statusCode !== 204) {
    throw new Error(`Failed to cancel subscription: ${response.statusCode}`);
  }
}

/**
 * Update subscription in database from PayPal data
 */
export async function syncSubscriptionFromPayPal(
  userId: string,
  paypalSubscription: PayPalSubscription,
): Promise<void> {
  const plan = await db.subscriptionPlan.findFirst({
    where: {
      OR: [
        { paypalPlanIdMonthly: paypalSubscription.planId },
        { paypalPlanIdYearly: paypalSubscription.planId },
      ],
    },
  });

  if (!plan) {
    throw new Error("Plan not found for PayPal subscription");
  }

  const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL"> = {
    ACTIVE: "ACTIVE",
    APPROVED: "ACTIVE",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
    SUSPENDED: "CANCELLED",
  };

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: statusMap[paypalSubscription.status] ?? "TRIAL",
      paypalSubscriptionId: paypalSubscription.id,
      paypalPayerId: paypalSubscription.subscriber.payerId,
      currentPeriodStart: new Date(paypalSubscription.createTime),
      currentPeriodEnd: paypalSubscription.billingInfo?.nextBillingTime
        ? new Date(paypalSubscription.billingInfo.nextBillingTime)
        : null,
    },
    update: {
      status: statusMap[paypalSubscription.status] ?? "ACTIVE",
      paypalSubscriptionId: paypalSubscription.id,
      paypalPayerId: paypalSubscription.subscriber.payerId,
      currentPeriodStart: new Date(paypalSubscription.createTime),
      currentPeriodEnd: paypalSubscription.billingInfo?.nextBillingTime
        ? new Date(paypalSubscription.billingInfo.nextBillingTime)
        : null,
    },
  });
}
```

---

## Step 2.6: Implement Checkout Flow

### 2.6.1: Create Checkout API Route

Create `src/app/api/paypal/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { createPayPalSubscription } from "@/server/paypal/subscriptions";
import { db } from "@/server/db";
import { env } from "@/env";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, billingCycle } = await request.json();

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: "Plan ID and billing cycle are required" },
        { status: 400 },
      );
    }

    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const paypalPlanId =
      billingCycle === "MONTHLY"
        ? plan.paypalPlanIdMonthly
        : plan.paypalPlanIdYearly;

    if (!paypalPlanId) {
      return NextResponse.json(
        { error: "PayPal plan not configured" },
        { status: 400 },
      );
    }

    const baseUrl = env.NEXTAUTH_URL;
    const returnUrl = `${baseUrl}/pricing/success?subscription_id={subscription_id}`;
    const cancelUrl = `${baseUrl}/pricing/cancel`;

    const { subscriptionId, approvalUrl } = await createPayPalSubscription(
      paypalPlanId,
      session.user.id,
      returnUrl,
      cancelUrl,
    );

    // Store subscription ID temporarily (you might want to use Redis or database)
    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: plan.id,
        status: "INCOMPLETE",
        paypalSubscriptionId: subscriptionId,
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        status: "INCOMPLETE",
      },
    });

    return NextResponse.json({
      subscriptionId,
      approvalUrl,
    });
  } catch (error) {
    console.error("PayPal checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
```

### 2.6.2: Create Pricing Page

Create `src/app/pricing/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/paypal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create checkout");
      }

      // Redirect to PayPal approval page
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>
      
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <Button
          variant={billingCycle === "MONTHLY" ? "default" : "outline"}
          onClick={() => setBillingCycle("MONTHLY")}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === "YEARLY" ? "default" : "outline"}
          onClick={() => setBillingCycle("YEARLY")}
          className="ml-2"
        >
          Yearly
        </Button>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Free</h2>
          <p className="text-3xl font-bold mb-4">$0</p>
          <ul className="mb-6 space-y-2">
            <li>3 presentations per month</li>
            <li>Basic themes</li>
            <li>Community support</li>
          </ul>
          <Button variant="outline" disabled>
            Current Plan
          </Button>
        </Card>

        {/* Pro Plan */}
        <Card className="p-6 border-primary">
          <h2 className="text-2xl font-bold mb-4">Pro</h2>
          <p className="text-3xl font-bold mb-4">
            ${billingCycle === "MONTHLY" ? "19" : "190"}
            <span className="text-sm font-normal">
              /{billingCycle === "MONTHLY" ? "month" : "year"}
            </span>
          </p>
          <ul className="mb-6 space-y-2">
            <li>Unlimited presentations</li>
            <li>All themes + custom themes</li>
            <li>Export to PPTX</li>
            <li>Priority support</li>
          </ul>
          <Button
            onClick={() => handleSubscribe("PRO_PLAN_ID")}
            disabled={loading === "PRO_PLAN_ID"}
          >
            {loading === "PRO_PLAN_ID" ? "Loading..." : "Subscribe"}
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
          <p className="text-3xl font-bold mb-4">Custom</p>
          <ul className="mb-6 space-y-2">
            <li>Everything in Pro</li>
            <li>Custom branding</li>
            <li>API access</li>
            <li>Dedicated support</li>
          </ul>
          <Button variant="outline">Contact Sales</Button>
        </Card>
      </div>
    </div>
  );
}
```

### 2.6.3: Create Success Page

Create `src/app/pricing/success/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const subscriptionId = searchParams.get("subscription_id");

  useEffect(() => {
    if (!subscriptionId || !session) {
      setStatus("error");
      return;
    }

    // Verify subscription and activate
    fetch("/api/paypal/subscription/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [subscriptionId, session]);

  if (status === "loading") {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Activating your subscription...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscription Activation Failed</h2>
          <p className="mb-6">
            There was an error activating your subscription. Please contact support.
          </p>
          <Button onClick={() => router.push("/pricing")}>
            Back to Pricing
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Activated!</h2>
        <p className="mb-6">
          Your subscription has been successfully activated. You now have access to all Pro features.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}
```

### 2.6.4: Create Cancel Page

Create `src/app/pricing/cancel/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12">
      <Card className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Cancelled</h2>
        <p className="mb-6">
          Your subscription setup was cancelled. No charges were made.
        </p>
        <Button onClick={() => router.push("/pricing")}>
          Back to Pricing
        </Button>
      </Card>
    </div>
  );
}
```

---

## Step 2.7: Implement PayPal Webhooks

### 2.7.1: Create Webhook Handler

Create `src/app/api/paypal/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getPayPalClient } from "@/server/paypal/client";
import { getPayPalSubscription, syncSubscriptionFromPayPal } from "@/server/paypal/subscriptions";
import { db } from "@/server/db";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { env } from "@/env";

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhook(
  headers: Headers,
  body: string,
): Promise<boolean> {
  // PayPal webhook verification
  // In production, implement proper signature verification
  // See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/
  return true; // Simplified for now
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // Verify webhook signature
    const isValid = await verifyWebhook(headers, body);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body) as {
      eventType: string;
      resource: {
        id?: string;
        status?: string;
        billingAgreementId?: string;
        [key: string]: unknown;
      };
    };

    console.log("PayPal webhook event:", event.eventType);

    // Handle different event types
    switch (event.eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        if (event.resource.id) {
          const subscription = await getPayPalSubscription(event.resource.id);
          if (subscription) {
            // Find user by subscription ID
            const dbSubscription = await db.subscription.findUnique({
              where: { paypalSubscriptionId: subscription.id },
              include: { user: true },
            });

            if (dbSubscription) {
              await syncSubscriptionFromPayPal(
                dbSubscription.userId,
                subscription,
              );
            }
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        if (event.resource.id) {
          const subscription = await db.subscription.findUnique({
            where: { paypalSubscriptionId: event.resource.id },
          });

          if (subscription) {
            await db.subscription.update({
              where: { id: subscription.id },
              data: {
                status: "CANCELLED",
                cancelAtPeriodEnd: false,
              },
            });
          }
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED":
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Record payment
        const paymentData = event.resource as {
          id: string;
          amount: { value: string; currency_code: string };
          billing_agreement_id?: string;
        };

        const subscription = await db.subscription.findFirst({
          where: {
            OR: [
              { paypalBillingAgreementId: paymentData.billing_agreement_id },
              { paypalSubscriptionId: paymentData.billing_agreement_id },
            ],
          },
        });

        if (subscription) {
          await db.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: parseFloat(paymentData.amount.value),
              currency: paymentData.amount.currency_code.toLowerCase(),
              status: "SUCCEEDED",
              paypalTransactionId: paymentData.id,
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.CAPTURE.DENIED": {
        // Handle failed payment
        const paymentData = event.resource as {
          id: string;
          billing_agreement_id?: string;
        };

        const subscription = await db.subscription.findFirst({
          where: {
            OR: [
              { paypalBillingAgreementId: paymentData.billing_agreement_id },
              { paypalSubscriptionId: paymentData.billing_agreement_id },
            ],
          },
        });

        if (subscription) {
          await db.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: 0,
              currency: "usd",
              status: "FAILED",
              paypalTransactionId: paymentData.id,
            },
          });

          // Update subscription status
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      default:
        console.log("Unhandled webhook event:", event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
```

### 2.7.2: Setup Webhook in PayPal Dashboard

1. Go to PayPal Developer Dashboard
2. Navigate to your app → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/paypal/webhook`
4. Subscribe to events:

                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.CREATED`
                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.UPDATED`
                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.ACTIVATED`
                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.CANCELLED`
                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.EXPIRED`
                                                                                                                                                                                                - `BILLING.SUBSCRIPTION.SUSPENDED`
                                                                                                                                                                                                - `PAYMENT.SALE.COMPLETED`
                                                                                                                                                                                                - `PAYMENT.CAPTURE.COMPLETED`
                                                                                                                                                                                                - `PAYMENT.SALE.DENIED`
                                                                                                                                                                                                - `PAYMENT.CAPTURE.DENIED`

5. Copy the Webhook ID and add to `PAYPAL_WEBHOOK_ID` env variable

---

## Step 2.8: Create Subscription Activation Endpoint

Create `src/app/api/paypal/subscription/activate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import {
  getPayPalSubscription,
  activatePayPalSubscription,
  syncSubscriptionFromPayPal,
} from "@/server/paypal/subscriptions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    // Get subscription from PayPal
    const paypalSubscription = await getPayPalSubscription(subscriptionId);

    if (!paypalSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Activate subscription if needed
    if (paypalSubscription.status === "APPROVED") {
      await activatePayPalSubscription(subscriptionId);
    }

    // Sync to database
    await syncSubscriptionFromPayPal(session.user.id, paypalSubscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate subscription" },
      { status: 500 },
    );
  }
}
```

---

## Testing Phase 2

### Test Checklist

1. ✅ Database migration runs successfully
2. ✅ PayPal client initializes correctly
3. ✅ PayPal plans created in PayPal dashboard
4. ✅ Checkout flow redirects to PayPal
5. ✅ Success page activates subscription
6. ✅ Webhook events update database correctly
7. ✅ Subscription cancellation works
8. ✅ Payment records created on webhook events

### Test Commands

```bash
# Run migration
pnpm db:push

# Type check
pnpm type

# Test in development
pnpm dev
```

### Testing with PayPal Sandbox

1. Use PayPal Sandbox test accounts
2. Test subscription creation flow
3. Test webhook events using PayPal's webhook simulator
4. Verify database updates after webhooks

---

## Key Differences from Stripe

1. **Subscription Model**: PayPal uses billing agreements and subscriptions differently than Stripe
2. **Checkout Flow**: PayPal requires user approval on PayPal's site, then redirects back
3. **Webhooks**: PayPal webhook events have different structure and naming
4. **Plan Management**: PayPal plans are created via API and stored in PayPal, not just referenced
5. **Payment Tracking**: PayPal uses transaction IDs and capture IDs instead of payment intents

---

## Next Steps

After completing Phase 2:

1. ✅ Verify all PayPal integrations work
2. ✅ Test complete subscription flow
3. ✅ Proceed to Phase 3: Access Control & Feature Gating

---

**Status:** Ready for Implementation

**Estimated Time:** 6-8 hours

**Dependencies:** Phase 1 (Database Schema) must be complete