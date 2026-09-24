import * as Sentry from "@sentry/nextjs";

// Browser Sentry setup. Only NEXT_PUBLIC_* variables reach the client bundle,
// so the DSN must be exposed as NEXT_PUBLIC_SENTRY_DSN.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
