import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    TAVILY_API_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    OPENAI_API_KEY: z.string(),
    TOGETHER_AI_API_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    UNSPLASH_ACCESS_KEY: z.string(),
    NEXTAUTH_URL: z.preprocess(
      (str) => {
        const url = process.env.VERCEL_URL ?? str;

        // Vercel exposes VERCEL_URL as a hostname without a protocol.
        return typeof url === "string" && !url.includes("://")
          ? `https://${url}`
          : url;
      },
      z.string().url(),
    ),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    // PayPal Configuration
    PAYPAL_CLIENT_ID: z.string(),
    PAYPAL_CLIENT_SECRET: z.string(),
    PAYPAL_WEBHOOK_ID: z.string().optional(),
    PAYPAL_MODE: z.enum(["sandbox", "live"]).default("sandbox"),
    ADMIN_EMAILS: z.string().optional(),
    // Admin credentials login is disabled unless this is set.
    ADMIN_PASSWORD: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    SALES_EMAIL: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),

    // Rate limiting (disabled when unset)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // LLM observability (optional)
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_HOST: z.string().url().optional(),

    // Allow Ollama / LM Studio providers in production
    ALLOW_LOCAL_MODELS: z.enum(["true", "false"]).optional(),
  },

  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TOGETHER_AI_API_KEY: process.env.TOGETHER_AI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    PAYPAL_MODE: process.env.PAYPAL_MODE,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SALES_EMAIL: process.env.SALES_EMAIL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY,
    LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY,
    LANGFUSE_HOST: process.env.LANGFUSE_HOST,
    ALLOW_LOCAL_MODELS: process.env.ALLOW_LOCAL_MODELS,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
