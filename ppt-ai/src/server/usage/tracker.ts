import { db } from "@/server/db";
import { type SubscriptionPlanName } from "@prisma/client";
import { PLAN_LIMITS } from "@/server/subscription/plans";

export type UsageFeature =
    | "presentations_created"
    | "api_calls"
    | "images_generated"
    | "storage_mb";

export const UsageTracker = {
    /**
     * Track a usage event for a user.
     * Logs the individual event to the Usage table.
     */
    async trackUsage(
        userId: string,
        feature: UsageFeature | string,
        amount: number,
        metadata?: Record<string, any>
    ) {
        try {
            // Use the service layer if available, or fallback to DB
            const { incrementUsage } = await import("@/server/subscription/service");
            await incrementUsage(userId, feature, amount, metadata);

            console.log(`[UsageTracker] Tracked ${amount} for ${feature} (User: ${userId})`);
        } catch (error) {
            console.error("[UsageTracker] Failed to track usage:", error);
        }
    },

    /**
     * Get current usage stats for a user for the current period.
     */
    async getUserUsage(userId: string) {
        try {
            const { getUsageForFeature } = await import("@/server/subscription/service");

            // Sum up known token-consuming features
            const aiFeatures = ["OPENAI_GPT4", "OPENAI_GPT35", "STABILITY_SDXL", "PRESENTATION_GENERATED"];
            let totalTokens = 0;

            for (const f of aiFeatures) {
                const stats = await getUsageForFeature(userId, f);
                totalTokens += stats.used;
            }

            const storageStats = await getUsageForFeature(userId, "STORAGE_UPLOAD");

            // Compatibility return for UI
            const presentations = await getUsageForFeature(userId, "presentations_created");
            const images = await getUsageForFeature(userId, "images_generated");
            const apiCalls = await getUsageForFeature(userId, "api_calls");

            return {
                totalTokens,
                totalStorage: storageStats.used,

                // Detailed stats
                presentations_created: presentations.used,
                images_generated: images.used,
                api_calls: apiCalls.used,
            };
        } catch (e) {
            console.error("Failed to get usage, falling back to db aggregation", e);

            // Fallback to direct DB aggregation (logic from master) if service fails or module missing
            const currentPeriod = new Date().toISOString().slice(0, 7);
            const usages = await db.usage.groupBy({
                by: ['feature'],
                where: { userId, period: currentPeriod },
                _sum: { amount: true },
            });
            const usageMap: Record<string, number> = {};
            usages.forEach(u => { usageMap[u.feature] = u._sum.amount ?? 0; });

            return {
                totalTokens: usageMap["images_generated"] || 0,
                totalStorage: 0,
                presentations_created: usageMap["presentations_created"] || 0,
                images_generated: usageMap["images_generated"] || 0,
                api_calls: usageMap["api_calls"] || 0,
            };
        }
    }
};
