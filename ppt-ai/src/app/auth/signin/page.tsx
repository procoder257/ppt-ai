"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignIn() {
  return (
    <AuthLayout
      mode="signin"
      heading="Welcome back"
      subheading="Sign in to your account to continue creating stunning presentations."
      callbackUrl="/presentation"
    />
  );
}
