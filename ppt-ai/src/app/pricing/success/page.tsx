"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // PayPal sends back subscription_id, ba_token, or token parameter
  const subscriptionId = searchParams.get("subscription_id") || searchParams.get("ba_token");
  const token = searchParams.get("token");

  // Debug logging
  useEffect(() => {
    console.log("Success page loaded");
    console.log("Search params:", {
      subscription_id: searchParams.get("subscription_id"),
      ba_token: searchParams.get("ba_token"),
      token: searchParams.get("token"),
      all: Array.from(searchParams.entries())
    });
  }, [searchParams]);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    // Need either subscriptionId from our API or token from PayPal
    if ((!subscriptionId && !token) || !session) {
      console.log("Missing required data:", { subscriptionId, token, hasSession: !!session });
      setStatus("error");
      return;
    }

    // If we have a token but no subscription_id, we need to get it from the database
    async function activateSubscription() {
      try {
        let subId = subscriptionId;

        // If no subscription ID but have token, get from database
        if (!subId && session?.user?.id) {
          const checkResponse = await fetch("/api/subscription/check");
          const checkData = await checkResponse.json();

          if (checkData.subscription?.paypalSubscriptionId) {
            subId = checkData.subscription.paypalSubscriptionId;
          }
        }

        if (!subId) {
          console.error("Could not find subscription ID");
          setStatus("error");
          return;
        }

        // Verify subscription and activate
        const response = await fetch("/api/paypal/subscription/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: subId }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          console.error("Activation API failed");
          setStatus("error");
        }
      } catch (error) {
        console.error("Activation error:", error);
        setStatus("error");
      }
    }

    activateSubscription();
  }, [subscriptionId, token, session, sessionStatus]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/presentation");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === "loading" || sessionStatus === "loading") {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Activating your subscription...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscription Activation Failed</h2>
          <p className="mb-6">
            There was an error activating your subscription. Please contact support.
          </p>
          <Button onClick={() => router.push("/pricing")}>
            Back to Pricing
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Activated!</h2>
        <p className="mb-6">
          Your subscription has been successfully activated. Redirecting you to the dashboard...
        </p>
        <Button onClick={() => router.push("/presentation")}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 text-center">
        <p>Loading...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
