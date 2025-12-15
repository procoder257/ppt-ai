import { db } from "@/server/db";
import type { SubscriptionPlanName, SubscriptionStatus } from "@prisma/client";
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
export async function getUserPlan(
  userId: string,
): Promise<SubscriptionPlanName> {
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

  const hasFeature =
    features[feature] === true ||
    (typeof features[feature] === "number" &&
      (features[feature] as number) > 0);

  if (!hasFeature) {
    return {
      hasAccess: false,
      reason: `Feature "${feature}" not available in ${plan} plan`,
    };
  }

  // Check usage limits if applicable
  if (feature.includes("PerMonth") || feature.includes("_")) {
    const usage = await getUsageForFeature(userId, feature);
    const limit = PLAN_LIMITS[plan]?.[feature] ?? 0;

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
  const limit = PLAN_LIMITS[plan]?.[feature] ?? 0;

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
      metadata: (metadata ?? {}) as Record<string, string | number | boolean>,
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
