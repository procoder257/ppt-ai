import { Resend } from "resend";
import { env } from "@/env";

/**
 * Initialize Resend client.
 * API Key is validated in src/env.js
 */
export const resend = new Resend(env.RESEND_API_KEY);

/**
 * Default sender email address.
 * Ideally this should be from a verified domain like "noreply@yourdomain.com"
 * For testing/onboarding, use "onboarding@resend.dev" only if sending to your own email.
 */
export const EMAIL_SENDER = "PPT AI <onboarding@resend.dev>";
