"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignUp() {
    return (
        <AuthLayout
            mode="signup"
            heading="Create an account"
            subheading="Join thousands of teams crafting beautiful presentations with AI."
        />
    );
}
