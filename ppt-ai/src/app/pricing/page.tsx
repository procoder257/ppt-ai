"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { ContactSalesModal } from "@/components/pricing/ContactSalesModal";

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [loading, setLoading] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/subscription/check")
        .then((res) => res.json())
        .then((data) => setSubscription(data))
        .catch((err) => console.error("Failed to check subscription:", err));
    }
  }, [session]);

  const handleSubscribe = async (planName: "STARTER" | "PRO") => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch("/api/paypal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details ?? data.error ?? "Failed to create checkout");
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL received from PayPal");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isStarter = subscription?.subscription?.plan?.name === "STARTER" && subscription.hasActiveSubscription;
  const isPro = subscription?.subscription?.plan?.name === "PRO" && subscription.hasActiveSubscription;

  const starterPlanId = billingCycle === "MONTHLY"
    ? "P-6YS76998ST9320021NFDGAHA"
    : "P-0HC52330X35574305NFDGAHQ";

  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <ContactSalesModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            The <span className="text-primary">perfect plan</span> for every team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            The only presentation software that delivers stunning returns
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground/80 max-w-2xl mx-auto pt-4"
          >
            The prices shown below are for the US. Your actual price might vary depending on your country to adjust for purchasing power parity.
          </motion.p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-muted p-1 rounded-full flex items-center relative">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === "MONTHLY" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === "YEARLY" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly
            </button>
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-primary rounded-full transition-all duration-300 ease-in-out shadow-sm ${billingCycle === "MONTHLY" ? "left-1" : "left-[calc(50%-4px)] translate-x-1"}`}
            />
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* STARTER */}
          <Card className={`p-8 border-transparent shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group ${isStarter ? "ring-2 ring-primary" : ""}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h3 className="text-sm font-bold tracking-wider text-purple-600 uppercase">Starter</h3>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">${billingCycle === "MONTHLY" ? "25" : "20"}</span>
              {billingCycle === "YEARLY" && <span className="text-lg text-muted-foreground font-medium">/mo</span>}
            </div>

            <div className="mb-8 p-3 bg-green-100 rounded-lg text-green-700 text-sm font-medium text-center">
              {billingCycle === "MONTHLY" ? "Flexible monthly plan" : "Billed $240 yearly"}
            </div>

            <p className="text-sm text-muted-foreground mb-6 font-medium">For any number of users</p>

            <ul className="space-y-4 mb-8">
              {[
                "Limited AI credits",
                "Share and publish",
                "Viewer analytics",
                "Basic templates"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 min-w-[1.25rem] min-h-[1.25rem] rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => !isStarter && handleSubscribe("STARTER")}
              disabled={isStarter || loading === "STARTER"}
              className={`w-full font-bold shadow-none ${isStarter ? "bg-primary/20 text-primary cursor-default" : "bg-primary/10 hover:bg-primary/20 text-primary"}`}
            >
              {isStarter ? "Current Plan" : (loading === "STARTER" ? "Processing..." : "Get Started")}
            </Button>
          </Card>

          {/* PRO */}
          <Card className={`p-8 border-primary shadow-2xl relative overflow-hidden transform md:-translate-y-4 ${isPro ? "ring-4 ring-primary ring-offset-2" : ""}`}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary fill-primary" />
              <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Pro</h3>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">${billingCycle === "MONTHLY" ? "35" : "30"}</span>
              {billingCycle === "YEARLY" && <span className="text-lg text-muted-foreground font-medium">/mo</span>}
            </div>

            <div className="mb-8 p-3 bg-green-100 rounded-lg text-green-700 text-sm font-medium text-center">
              {billingCycle === "MONTHLY" ? "Most popular choice" : "Billed $360 yearly"}
            </div>

            <p className="text-sm text-muted-foreground mb-6 font-medium">
              {billingCycle === "MONTHLY" ? "Per user, billed monthly" : "For one user per year"}
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Additional AI credits",
                "Pro templates",
                "Export to PPTX",
                "Commercial license",
                "Priority support"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                  <div className="mt-0.5 min-w-[1.25rem] min-h-[1.25rem] rounded bg-primary text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => !isPro && handleSubscribe("PRO")}
              disabled={isPro || loading === "PRO"}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/25"
            >
              {isPro ? "Current Plan" : (loading === "PRO" ? "Processing..." : "Upgrade to Pro")}
            </Button>
          </Card>

          {/* ENTERPRISE */}
          <Card className="p-8 border-transparent shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h3 className="text-sm font-bold tracking-wider text-purple-600 uppercase">Enterprise</h3>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">Contact Us</span>
            </div>

            <div className="mb-8 p-3 bg-green-100 rounded-lg text-green-700 text-sm font-medium text-center">
              For enterprises and large teams
            </div>

            <p className="text-sm text-muted-foreground mb-6 font-medium">For any number of users</p>

            <ul className="space-y-4 mb-8">
              {[
                "Unlimited AI credits",
                "Custom brand kits",
                "SSO & Security",
                "Dedicated Success Manager",
                "API Access"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 min-w-[1.25rem] min-h-[1.25rem] rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button onClick={() => setContactModalOpen(true)} variant="outline" className="w-full font-bold border-2 hover:bg-muted">
              Contact Sales
            </Button>
          </Card>
        </div>

        {/* Custom Plan Section */}
        <div className="mt-24 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Need a <span className="text-primary">custom plan</span> for your team?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Have a larger team with specific needs? We&apos;re here to listen. Let&apos;s get on a call and see what we can do.
          </p>
          <Button onClick={() => setContactModalOpen(true)} size="lg" className="px-8 font-bold bg-primary hover:bg-primary/90">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <PricingContent />
  );
}

