import * as Sentry from "@sentry/nextjs";

/**
 * Next.js calls register() once per runtime at startup. Without this file
 * the Sentry server/edge configs are never loaded and no errors are reported.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Reports errors thrown in server components, route handlers and server actions.
export const onRequestError = Sentry.captureRequestError;
