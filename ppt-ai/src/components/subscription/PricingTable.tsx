"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubscriptionPlanName } from "@prisma/client";

interface SubscriptionPlan {
    id: string;
    name: SubscriptionPlanName;
    displayName: string;
    description: string | null;
    priceMonthly: number;
    priceYearly: number | null;
    features: any; // JSON
    isActive: boolean;
}

interface PricingTableProps {
    plans: SubscriptionPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (!session) {
            router.push("/api/auth/signin");
            return;
        }

        setLoading(planId);

        try {
            const response = await fetch("/api/paypal/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    billingCycle,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Checkout failed:", data);
                console.error("Full error details:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: data.error,
                    details: data.details,
                    stack: data.stack,
                });
                throw new Error(data.details ?? data.error ?? "Failed to create checkout");
            }

            // Redirect to PayPal approval page
            if (data.approvalUrl) {
                window.location.href = data.approvalUrl;
            } else {
                throw new Error("No approval URL received from PayPal");
            }
        } catch (error) {
            console.error("Subscription error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to start subscription";
            alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
        } finally {
            setLoading(null);
        }
    };

    const getFeatures = (planName: SubscriptionPlanName) => {
        switch (planName) {
            case "FREE":
                return [
                    "3 presentations per month",
                    "Basic themes",
                    "Community support"
                ];
            case "PRO":
                return [
                    "Unlimited presentations",
                    "All themes + custom themes",
                    "Export to PPTX",
                    "Priority support"
                ];
            case "ENTERPRISE":
                return [
                    "Everything in Pro",
                    "Custom branding",
                    "API access",
                    "Dedicated support"
                ];
            default:
                return [];
        }
    };

    const sortedPlans = [...plans].sort((a, b) => {
        const order = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
        return (order[a.name] || 0) - (order[b.name] || 0);
    });

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>

            {/* Billing cycle toggle */}
            <div className="flex justify-center mb-8">
                <Button
                    variant={billingCycle === "MONTHLY" ? "default" : "outline"}
                    onClick={() => setBillingCycle("MONTHLY")}
                >
                    Monthly
                </Button>
                <Button
                    variant={billingCycle === "YEARLY" ? "default" : "outline"}
                    onClick={() => setBillingCycle("YEARLY")}
                    className="ml-2"
                >
                    Yearly
                </Button>
            </div>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {sortedPlans.map((plan) => (
                    <Card key={plan.id} className={`p-6 ${plan.name === 'PRO' ? 'border-primary' : ''}`}>
                        <h2 className="text-2xl font-bold mb-4">{plan.displayName}</h2>
                        <p className="text-3xl font-bold mb-4">
                            {plan.name === "ENTERPRISE" ? (
                                "Custom"
                            ) : (
                                <>
                                    ${billingCycle === "MONTHLY" ? plan.priceMonthly : (plan.priceYearly || plan.priceMonthly * 10)}
                                    <span className="text-sm font-normal">
                                        /{billingCycle === "MONTHLY" ? "month" : "year"}
                                    </span>
                                </>
                            )}
                        </p>
                        <ul className="mb-6 space-y-2">
                            {getFeatures(plan.name).map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        {plan.name === "FREE" ? (
                            <Button variant="outline" disabled>
                                Current Plan
                            </Button>
                        ) : plan.name === "ENTERPRISE" ? (
                            <Button variant="outline">Contact Sales</Button>
                        ) : (
                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading === plan.id}
                            >
                                {loading === plan.id ? "Loading..." : "Subscribe"}
                            </Button>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
