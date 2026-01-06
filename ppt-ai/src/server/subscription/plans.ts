import type { SubscriptionPlanName } from "@prisma/client";

export const PLAN_FEATURES: Record<
  SubscriptionPlanName,
  Record<string, unknown>
> = {
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
  STARTER: {
    presentationsPerMonth: 10,
    canExportPPTX: true,
    canUseCustomThemes: false,
    canUsePremiumImages: false,
    maxSlidesPerPresentation: 30,
    supportLevel: "email",
    advancedAIModels: false,
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

export const PLAN_LIMITS: Record<SubscriptionPlanName, Record<string, number>> =
{
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
  STARTER: {
    presentations_created: 10,
    api_calls: 100,
    images_generated: 50,
    storage_mb: 500,
  },
  ENTERPRISE: {
    presentations_created: -1,
    api_calls: -1,
    images_generated: -1,
    storage_mb: -1,
  },
};
