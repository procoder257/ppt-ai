"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function CancelPageContent() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12">
      <Card className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Cancelled</h2>
        <p className="mb-6">
          Your subscription setup was cancelled. No charges were made.
        </p>
        <Button onClick={() => router.push("/pricing")}>
          Back to Pricing
        </Button>
      </Card>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 text-center">
        <p>Loading...</p>
      </div>
    }>
      <CancelPageContent />
    </Suspense>
  );
}
