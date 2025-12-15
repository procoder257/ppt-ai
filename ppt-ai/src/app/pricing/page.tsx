"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";

function PricingContent() {
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
        {/* Free Plan */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Free</h2>
          <p className="text-3xl font-bold mb-4">$0</p>
          <ul className="mb-6 space-y-2">
            <li>3 presentations per month</li>
            <li>Basic themes</li>
            <li>Community support</li>
          </ul>
          <Button variant="outline" disabled>
            Current Plan
          </Button>
        </Card>

        {/* Pro Plan */}
        <Card className="p-6 border-primary">
          <h2 className="text-2xl font-bold mb-4">Pro</h2>
          <p className="text-3xl font-bold mb-4">
            ${billingCycle === "MONTHLY" ? "19" : "190"}
            <span className="text-sm font-normal">
              /{billingCycle === "MONTHLY" ? "month" : "year"}
            </span>
          </p>
          <ul className="mb-6 space-y-2">
            <li>Unlimited presentations</li>
            <li>All themes + custom themes</li>
            <li>Export to PPTX</li>
            <li>Priority support</li>
          </ul>
          <Button
            onClick={() => handleSubscribe("cmj6vtrwg0001it0ufmgdsz4w")}
            disabled={loading === "cmj6vtrwg0001it0ufmgdsz4w"}
          >
            {loading === "cmj6vtrwg0001it0ufmgdsz4w" ? "Loading..." : "Subscribe"}
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
          <p className="text-3xl font-bold mb-4">Custom</p>
          <ul className="mb-6 space-y-2">
            <li>Everything in Pro</li>
            <li>Custom branding</li>
            <li>API access</li>
            <li>Dedicated support</li>
          </ul>
          <Button variant="outline">Contact Sales</Button>
        </Card>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <SubscriptionGate requireSubscription={false}>
      <PricingContent />
    </SubscriptionGate>
  );
}
