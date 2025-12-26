"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { type UsageMetric, getUsageMetrics } from "@/app/_actions/usage/getUsageMetrics";
import { UsageProgressBar } from "@/components/usage/UsageProgressBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function UsageSection() {
    const [metrics, setMetrics] = useState<UsageMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUsageMetrics()
            .then(setMetrics)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Current Usage</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (metrics.length === 0) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Current Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {metrics.map((metric) => (
                    <UsageProgressBar
                        key={metric.feature}
                        featureName={metric.displayName}
                        used={metric.used}
                        limit={metric.limit}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
