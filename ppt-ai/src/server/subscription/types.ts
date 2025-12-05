import type {
  SubscriptionStatus,
  SubscriptionPlanName,
  BillingCycle,
} from "@prisma/client";

export type SubscriptionWithPlan = {
  id: string;
  status: SubscriptionStatus;
  plan: {
    name: SubscriptionPlanName;
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
