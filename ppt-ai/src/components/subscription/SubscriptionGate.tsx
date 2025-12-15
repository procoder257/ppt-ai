"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SubscriptionGateProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

/**
 * Component that checks subscription status and redirects accordingly
 * - If requireSubscription=true: Redirects to /pricing if no subscription
 * - If requireSubscription=false: Redirects to /presentation if has subscription (for pricing page)
 */
export function SubscriptionGate({ children, requireSubscription = true }: SubscriptionGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      console.log("[SubscriptionGate] Checking subscription...", {
        requireSubscription,
        sessionStatus: status,
        userId: session?.user?.id
      });

      if (status === "loading") return;

      if (!session?.user?.id) {
        console.log("[SubscriptionGate] No session, showing content without redirect");
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription/check");
        const data = await response.json();

        console.log("[SubscriptionGate] Subscription check result:", data);

        setHasSubscription(data.hasActiveSubscription);
        setIsChecking(false);

        // Redirect logic
        if (requireSubscription && !data.hasActiveSubscription) {
          // User needs subscription but doesn't have one -> go to pricing
          console.log("[SubscriptionGate] ❌ No subscription required, redirecting to /pricing");
          router.push("/pricing");
        } else if (!requireSubscription && data.hasActiveSubscription) {
          // User is on pricing page but already has subscription -> go to app
          console.log("[SubscriptionGate] ✅ Has subscription, redirecting to /presentation");
          router.push("/presentation");
        } else if (requireSubscription && data.hasActiveSubscription) {
          console.log("[SubscriptionGate] ✅ Has subscription, showing protected content");
        } else {
          console.log("[SubscriptionGate] Showing pricing page (no subscription)");
        }
      } catch (error) {
        console.error("[SubscriptionGate] Error checking subscription:", error);
        setIsChecking(false);
        // On error, allow access to avoid blocking users
      }
    }

    checkSubscription();
  }, [session, status, router, requireSubscription]);

  // Show loading state while checking
  if (isChecking || status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
