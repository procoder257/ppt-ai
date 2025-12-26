
import { db } from "@/server/db";

interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

interface TrackUsageParams {
    userId: string;
    feature: string; // e.g., "token_usage"
    amount: number;
    model: string;
    type: "outline" | "presentation" | "chat";
    metadata?: Record<string, any>;
}

export async function trackTokenUsage({
    userId,
    feature = "token_usage",
    amount,
    model,
    type,
    metadata = {},
}: TrackUsageParams) {
    try {
        const period = new Date().toISOString().slice(0, 7); // "YYYY-MM"

        await db.usage.create({
            data: {
                userId,
                feature,
                amount,
                period,
                metadata: {
                    model,
                    type,
                    timestamp: new Date().toISOString(),
                    ...metadata,
                },
            },
        });

        console.log(`[Usage] Tracked ${amount} tokens for user ${userId} (${type})`);
    } catch (error) {
        console.error("[Usage] Failed to track usage:", error);
        // Non-blocking: don't throw, just log. We don't want to fail the request if stats fail.
    }
}
