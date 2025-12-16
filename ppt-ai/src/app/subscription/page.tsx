"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
            return;
        }

        if (status === "authenticated") {
            fetchSubscription();
        }
    }, [status, router]);

    const fetchSubscription = async () => {
        try {
            const res = await fetch("/api/subscription/check");
            const data = await res.json();
            setSubscription(data);
        } catch (error) {
            console.error("Failed to fetch subscription", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const hasActiveSubscription = subscription?.hasActiveSubscription;
    const planName = subscription?.subscription?.plan?.displayName || "Free Plan";
    const planStatus = subscription?.subscription?.status || "INACTIVE";

    return (
        <div className="container max-w-4xl mx-auto py-10">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:bg-transparent hover:underline"
                onClick={() => router.push("/presentation")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>
                                View and manage your subscription details.
                            </CardDescription>
                        </div>
                        <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                            {hasActiveSubscription ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-sm font-medium text-muted-foreground">Plan</p>
                            <p className="text-2xl font-bold mt-1">{planName}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p className="text-2xl font-bold mt-1 capitalize">
                                {planStatus.toLowerCase().replace("_", " ")}
                            </p>
                        </div>
                    </div>

                    {hasActiveSubscription && subscription?.subscription && (
                        <div className="space-y-2 mt-4">
                            <h3 className="font-semibold">Billing Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Cycle</span>
                                    <span className="capitalize">{subscription.subscription.billingCycle?.toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Renewal Date</span>
                                    <span>
                                        {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    {!hasActiveSubscription ? (
                        <Button onClick={() => router.push("/pricing")}>
                            Upgrade Plan
                        </Button>
                    ) : (
                        // Placeholder for manage logic (e.g. portal link or cancel)
                        <Button variant="outline" onClick={() => router.push("/pricing")}>
                            Change Plan
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
