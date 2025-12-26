"use server";

import { auth } from "@/server/auth";
import { getUsageForFeature, getUserPlan } from "@/server/subscription/service";

export interface UsageMetric {
    feature: string;
    displayName: string;
    used: number;
    limit: number;
    remaining: number;
}

export async function getUsageMetrics(): Promise<UsageMetric[]> {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const userId = session.user.id;

    // Define features to track and display
    const trackedFeatures = [
        { key: "OPENAI_GPT4", label: "GPT-4 Tokens" },
        { key: "PRESENTATION_GENERATED", label: "Presentations Generated" },
        { key: "STORAGE_UPLOAD", label: "Storage (MB)" },
    ];

    const metrics: UsageMetric[] = [];

    for (const f of trackedFeatures) {
        const stats = await getUsageForFeature(userId, f.key);
        metrics.push({
            feature: f.key,
            displayName: f.label,
            used: stats.used,
            limit: stats.limit,
            remaining: stats.remaining,
        });
    }

    return metrics;
}
