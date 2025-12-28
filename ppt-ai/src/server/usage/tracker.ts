import { db } from "@/server/db";
import { type SubscriptionPlanName } from "@prisma/client";
import { PLAN_LIMITS } from "@/server/subscription/plans";
import { getUserPlan } from "@/server/subscription/service";

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
            const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

            // Get user's subscription to link if exists
            const subscription = await db.subscription.findUnique({
                where: { userId }
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

            console.log(`[UsageTracker] Tracked ${amount} for ${feature} (User: ${userId})`);
        } catch (error) {
            console.error("[UsageTracker] Failed to track usage:", error);
        }
    },

    /**
     * Get current usage stats for a user for the current period.
     */
    async getUserUsage(userId: string) {
        const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

        // Aggregate usage for all features in current period
        const usages = await db.usage.groupBy({
            by: ['feature'],
            where: {
                userId,
                period: currentPeriod,
            },
            _sum: {
                amount: true,
            },
        });

        // Convert to easy access map
        const usageMap: Record<string, number> = {};
        usages.forEach(u => {
            usageMap[u.feature] = u._sum.amount ?? 0;
        });

        // Also get total storage (all time)
        const storageUsage = await db.usage.aggregate({
            where: {
                userId,
                feature: "storage_mb",
            },
            _sum: {
                amount: true,
            }
        });

        return {
            // Specific features used in the UI
            totalTokens: usageMap["images_generated"] || 0, // Mapping images to tokens for compatibility
            totalStorage: storageUsage._sum.amount || 0,

            // Raw map for detailed checks
            api_calls: usageMap["api_calls"] || 0,
            presentations_created: usageMap["presentations_created"] || 0,
            images_generated: usageMap["images_generated"] || 0,
        };
    }
};
