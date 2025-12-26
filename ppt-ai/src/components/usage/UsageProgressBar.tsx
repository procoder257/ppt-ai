"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageProgressBarProps {
    used: number;
    limit: number;
    featureName: string;
    className?: string;
}

export function UsageProgressBar({
    used,
    limit,
    featureName,
    className,
}: UsageProgressBarProps) {
    // Calculate percentage, capped at 100 for visual purposes
    const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
    const isUnlimited = limit < 0;

    // Determine color based on usage
    const getColor = (pct: number) => {
        if (pct >= 90) return "bg-red-500";
        if (pct >= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const barColor = getColor(percentage);

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">{featureName}</span>
                <span className="text-muted-foreground">
                    {isUnlimited ? (
                        "Unlimited"
                    ) : (
                        <>
                            <span className={cn("font-semibold", percentage >= 90 && "text-red-500")}>
                                {used}
                            </span>
                            <span className="text-muted-foreground/60"> / {limit}</span>
                        </>
                    )}
                </span>
            </div>

            {!isUnlimited && (
                <Progress
                    value={percentage}
                    className={cn("h-2", `[&>div]:${barColor}`)}
                />
            )}

            {!isUnlimited && percentage >= 100 && (
                <p className="text-xs text-red-500 font-medium mt-1">
                    Usage limit reached. Please upgrade to continue.
                </p>
            )}
        </div>
    );
}
