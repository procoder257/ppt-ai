# Phase 1 Implementation Guide: Database Schema & Models

## Overview
This guide provides detailed implementation steps for Phase 1 of the commercialization plan.

---

## Step 1.1: Extend Prisma Schema for Subscriptions

### Current State Analysis
- User model has `hasAccess: Boolean` (simple boolean flag)
- No subscription tracking
- No payment history
- No usage tracking

### Implementation Steps

#### 1.1.1: Add Subscription Enums

Add to `prisma/schema.prisma`:

```prisma
enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
  INCOMPLETE
  INCOMPLETE_EXPIRED
}

enum SubscriptionPlan {
  FREE
  PRO
  ENTERPRISE
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}
```

#### 1.1.2: Add SubscriptionPlan Model

```prisma
model SubscriptionPlan {
  id            String   @id @default(cuid())
  name          SubscriptionPlan @unique
  displayName   String
  description   String?
  priceMonthly  Float    @default(0)
  priceYearly   Float?   @default(0)
  stripePriceIdMonthly String?
  stripePriceIdYearly  String?
  features      Json     // Store feature flags as JSON
  limits        Json     // Store usage limits as JSON
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  subscriptions Subscription[]
  
  @@index([name])
}
```

#### 1.1.3: Add Subscription Model

```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String             @unique
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId            String
  plan              SubscriptionPlan   @relation(fields: [planId], references: [id])
  status            SubscriptionStatus @default(TRIAL)
  billingCycle      BillingCycle?
  stripeSubscriptionId String?         @unique
  stripeCustomerId  String?            @unique
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean           @default(false)
  trialEndsAt        DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  
  payments          Payment[]
  usage             Usage[]
  
  @@index([userId])
  @@index([status])
  @@index([stripeSubscriptionId])
}
```

#### 1.1.4: Add Payment Model

```prisma
model Payment {
  id                String        @id @default(cuid())
  subscriptionId    String
  subscription      Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  amount            Float
  currency          String        @default("usd")
  status            PaymentStatus @default(PENDING)
  stripePaymentIntentId String?   @unique
  stripeInvoiceId   String?       @unique
  billingCycle      BillingCycle?
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([subscriptionId])
  @@index([status])
  @@index([stripePaymentIntentId])
}
```

#### 1.1.5: Add Usage Model

```prisma
model Usage {
  id            String       @id @default(cuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionId String?
  subscription  Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  feature       String       // e.g., "presentations_created", "api_calls", "images_generated"
  amount        Int          @default(1)
  period        String       // e.g., "2024-01" for monthly tracking
  metadata      Json?        // Additional context
  createdAt     DateTime     @default(now())
  
  @@index([userId, feature, period])
  @@index([subscriptionId])
  @@index([period])
}
```

#### 1.1.6: Update User Model

Replace the simple `hasAccess` boolean with subscription relationship:

```prisma
model User {
  // ... existing fields ...
  
  role      UserRole @default(USER)
  hasAccess Boolean  @default(false) // Keep for backward compatibility, will be computed
  
  // Add subscription relationship
  subscription Subscription?
  
  // Add usage tracking
  usage      Usage[]
  
  // ... rest of existing fields ...
}
```

#### 1.1.7: Run Migration

```bash
# Generate Prisma client
pnpm db:push

# Or create a migration file
npx prisma migrate dev --name add_subscription_models
```

---

## Step 1.2: Create Subscription Service Layer

### Directory Structure

```
src/server/subscription/
├── types.ts
├── plans.ts
├── limits.ts
└── service.ts
```

### 1.2.1: Create Types (`types.ts`)

```typescript
import { type SubscriptionStatus, type SubscriptionPlan, type BillingCycle } from "@prisma/client";

export type SubscriptionWithPlan = {
  id: string;
  status: SubscriptionStatus;
  plan: {
    name: SubscriptionPlan;
    displayName: string;
    features: Record<string, unknown>;
    limits: Record<string, unknown>;
  };
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
};

export type FeatureAccess = {
  hasAccess: boolean;
  reason?: string;
  remainingQuota?: number;
  limit?: number;
};

export type UsageStats = {
  feature: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
};
```

### 1.2.2: Define Plans (`plans.ts`)

```typescript
import { type SubscriptionPlan } from "@prisma/client";

export const PLAN_FEATURES: Record<SubscriptionPlan, Record<string, unknown>> = {
  FREE: {
    presentationsPerMonth: 3,
    canExportPPTX: false,
    canUseCustomThemes: false,
    canUsePremiumImages: false,
    maxSlidesPerPresentation: 20,
    supportLevel: "community",
  },
  PRO: {
    presentationsPerMonth: -1, // unlimited
    canExportPPTX: true,
    canUseCustomThemes: true,
    canUsePremiumImages: true,
    maxSlidesPerPresentation: -1, // unlimited
    supportLevel: "priority",
    advancedAIModels: true,
  },
  ENTERPRISE: {
    presentationsPerMonth: -1,
    canExportPPTX: true,
    canUseCustomThemes: true,
    canUsePremiumImages: true,
    maxSlidesPerPresentation: -1,
    supportLevel: "dedicated",
    advancedAIModels: true,
    customBranding: true,
    apiAccess: true,
    sla: true,
  },
};

export const PLAN_LIMITS: Record<SubscriptionPlan, Record<string, number>> = {
  FREE: {
    presentations_created: 3,
    api_calls: 50,
    images_generated: 20,
    storage_mb: 100,
  },
  PRO: {
    presentations_created: -1, // unlimited
    api_calls: -1,
    images_generated: -1,
    storage_mb: 1000,
  },
  ENTERPRISE: {
    presentations_created: -1,
    api_calls: -1,
    images_generated: -1,
    storage_mb: -1,
  },
};
```

### 1.2.3: Create Service (`service.ts`)

```typescript
import { db } from "@/server/db";
import { type SubscriptionPlan, type SubscriptionStatus } from "@prisma/client";
import { PLAN_FEATURES, PLAN_LIMITS } from "./plans";
import type { SubscriptionWithPlan, FeatureAccess, UsageStats } from "./types";

/**
 * Get user's active subscription with plan details
 */
export async function getUserSubscription(
  userId: string,
): Promise<SubscriptionWithPlan | null> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    status: subscription.status,
    plan: {
      name: subscription.plan.name,
      displayName: subscription.plan.displayName,
      features: subscription.plan.features as Record<string, unknown>,
      limits: subscription.plan.limits as Record<string, unknown>,
    },
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEndsAt: subscription.trialEndsAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

/**
 * Get user's current plan (defaults to FREE if no subscription)
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return "FREE";
  }

  // Check if subscription is active or in trial
  if (
    subscription.status === "ACTIVE" ||
    (subscription.status === "TRIAL" && 
     subscription.trialEndsAt && 
     subscription.trialEndsAt > new Date())
  ) {
    return subscription.plan.name;
  }

  return "FREE";
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: string,
): Promise<FeatureAccess> {
  const plan = await getUserPlan(userId);
  const features = PLAN_FEATURES[plan];
  
  const hasFeature = features[feature] === true || 
                    (typeof features[feature] === "number" && features[feature] > 0);

  if (!hasFeature) {
    return {
      hasAccess: false,
      reason: `Feature "${feature}" not available in ${plan} plan`,
    };
  }

  // Check usage limits if applicable
  if (feature.includes("PerMonth") || feature.includes("_")) {
    const usage = await getUsageForFeature(userId, feature);
    const limit = PLAN_LIMITS[plan][feature] ?? 0;
    
    if (limit > 0 && usage.used >= limit) {
      return {
        hasAccess: false,
        reason: `Usage limit reached for ${feature}`,
        remainingQuota: 0,
        limit,
      };
    }

    return {
      hasAccess: true,
      remainingQuota: limit > 0 ? limit - usage.used : -1,
      limit: limit > 0 ? limit : undefined,
    };
  }

  return { hasAccess: true };
}

/**
 * Get usage statistics for a feature
 */
export async function getUsageForFeature(
  userId: string,
  feature: string,
): Promise<UsageStats> {
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const usage = await db.usage.aggregate({
    where: {
      userId,
      feature,
      period: currentPeriod,
    },
    _sum: {
      amount: true,
    },
  });

  const used = usage._sum.amount ?? 0;
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan][feature] ?? 0;

  return {
    feature,
    used,
    limit: limit < 0 ? -1 : limit,
    remaining: limit < 0 ? -1 : Math.max(0, limit - used),
    period: currentPeriod,
  };
}

/**
 * Increment usage for a feature
 */
export async function incrementUsage(
  userId: string,
  feature: string,
  amount: number = 1,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const currentPeriod = new Date().toISOString().slice(0, 7);
  
  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  await db.usage.create({
    data: {
      userId,
      subscriptionId: subscription?.id,
      feature,
      amount,
      period: currentPeriod,
      metadata: metadata ?? {},
    },
  });
}

/**
 * Check if user has exceeded usage limit
 */
export async function checkUsageLimit(
  userId: string,
  feature: string,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const usage = await getUsageForFeature(userId, feature);
  const limit = usage.limit;

  if (limit < 0) {
    // Unlimited
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const remaining = Math.max(0, limit - usage.used);
  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}

/**
 * Check if user has active subscription or valid trial
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }

  // Check if subscription is active
  if (subscription.status === "ACTIVE") {
    return true;
  }

  // Check if trial is still valid
  if (
    subscription.status === "TRIAL" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt > new Date()
  ) {
    return true;
  }

  return false;
}
```

### 1.2.4: Seed Initial Plans

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, SubscriptionPlan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Free Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "FREE" },
    update: {},
    create: {
      name: "FREE",
      displayName: "Free",
      description: "Perfect for getting started",
      priceMonthly: 0,
      priceYearly: 0,
      features: {
        presentationsPerMonth: 3,
        canExportPPTX: false,
        canUseCustomThemes: false,
        canUsePremiumImages: false,
        maxSlidesPerPresentation: 20,
        supportLevel: "community",
      },
      limits: {
        presentations_created: 3,
        api_calls: 50,
        images_generated: 20,
        storage_mb: 100,
      },
    },
  });

  // Create Pro Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "PRO" },
    update: {},
    create: {
      name: "PRO",
      displayName: "Pro",
      description: "For professionals and teams",
      priceMonthly: 19,
      priceYearly: 190,
      features: {
        presentationsPerMonth: -1,
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: -1,
        supportLevel: "priority",
        advancedAIModels: true,
      },
      limits: {
        presentations_created: -1,
        api_calls: -1,
        images_generated: -1,
        storage_mb: 1000,
      },
    },
  });

  // Create Enterprise Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "ENTERPRISE" },
    update: {},
    create: {
      name: "ENTERPRISE",
      displayName: "Enterprise",
      description: "For large organizations",
      priceMonthly: 0, // Custom pricing
      priceYearly: 0,
      features: {
        presentationsPerMonth: -1,
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: -1,
        supportLevel: "dedicated",
        advancedAIModels: true,
        customBranding: true,
        apiAccess: true,
        sla: true,
      },
      limits: {
        presentations_created: -1,
        api_calls: -1,
        images_generated: -1,
        storage_mb: -1,
      },
    },
  });

  console.log("Subscription plans seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:
```bash
pnpm prisma db seed
```

---

## Testing Phase 1

### Test Checklist

1. ✅ Database migration runs successfully
2. ✅ All models created in database
3. ✅ Subscription plans seeded
4. ✅ `getUserSubscription()` returns null for new users
5. ✅ `getUserPlan()` returns "FREE" for users without subscription
6. ✅ `checkFeatureAccess()` correctly checks features
7. ✅ `incrementUsage()` creates usage records
8. ✅ `checkUsageLimit()` enforces limits correctly
9. ✅ TypeScript types compile without errors

### Test Commands

```bash
# Run migration
pnpm db:push

# Seed plans
pnpm prisma db seed

# Generate Prisma client
pnpm prisma generate

# Type check
pnpm type
```

---

## Next Steps

After completing Phase 1:
1. ✅ Verify all database models are created
2. ✅ Test subscription service functions
3. ✅ Proceed to Phase 2: Payment Gateway Integration

---

**Status:** Ready for Implementation  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

