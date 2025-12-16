import { db } from "@/server/db";

export type UsageFeature =
    | "OPENAI_GPT4"
    | "OPENAI_GPT35"
    | "STABILITY_SDXL"
    | "STORAGE_UPLOAD"
    | "PRESENTATION_GENERATED";

export const UsageTracker = {
    /**
     * Track a usage event for a user.
     * Logs the individual event and updates the user's aggregate totals.
     */
    async trackUsage(
        userId: string,
        feature: UsageFeature | string,
        amount: number,
        metadata?: Record<string, any>
    ) {
        try {
            // 1. Create detailed log entry
            await db.usageLog.create({
                data: {
                    userId,
                    feature,
                    tokens: amount,
                    metadata: metadata || {},
                },
            });

            // 2. Update aggregate totals
            const isStorage = feature === "STORAGE_UPLOAD";

            await db.userUsage.upsert({
                where: { userId },
                create: {
                    userId,
                    totalTokens: isStorage ? 0 : amount,
                    totalStorage: isStorage ? amount : 0,
                },
                update: {
                    totalTokens: isStorage ? undefined : { increment: amount },
                    totalStorage: isStorage ? { increment: amount } : undefined,
                },
            });

            console.log(`[UsageTracker] Tracked ${amount} for ${feature} (User: ${userId})`);
        } catch (error) {
            console.error("[UsageTracker] Failed to track usage:", error);
            // We don't want to block the main flow if tracking fails, but we should log it.
        }
    },

    /**
     * Get current usage stats for a user.
     */
    async getUserUsage(userId: string) {
        const usage = await db.userUsage.findUnique({
            where: { userId },
        });

        return {
            totalTokens: usage?.totalTokens ? Number(usage.totalTokens) : 0,
            totalStorage: usage?.totalStorage ? Number(usage.totalStorage) : 0,
        };
    }
};
