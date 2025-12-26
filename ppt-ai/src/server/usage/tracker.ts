

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
            const { incrementUsage } = await import("@/server/subscription/service");
            await incrementUsage(userId, feature, amount, metadata);
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
        // Map unification:
        // totalTokens ~= sum of AI feature usage
        // totalStorage ~= STORAGE_UPLOAD usage

        const { getUsageForFeature } = await import("@/server/subscription/service");

        // Sum up known token-consuming features
        const aiFeatures = ["OPENAI_GPT4", "OPENAI_GPT35", "STABILITY_SDXL", "PRESENTATION_GENERATED"];
        let totalTokens = 0;

        for (const f of aiFeatures) {
            const stats = await getUsageForFeature(userId, f);
            totalTokens += stats.used;
        }

        const storageStats = await getUsageForFeature(userId, "STORAGE_UPLOAD");

        return {
            totalTokens,
            totalStorage: storageStats.used,
        };
    }
};
