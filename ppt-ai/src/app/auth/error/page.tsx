"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please try again later.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link may have been used or expired.",
  OAuthSignin: "Could not start the sign in process. Please try again.",
  OAuthCallback: "Could not complete sign in. Please try again.",
  OAuthCreateAccount: "Could not create account. Please try again.",
  EmailCreateAccount: "Could not create account. Please try again.",
  Callback: "Could not complete sign in. Please try again.",
  Default: "An error occurred during sign in. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">Sign In Error</h1>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
