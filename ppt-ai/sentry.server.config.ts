import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Sample 10% of transactions in production (override with SENTRY_TRACES_SAMPLE_RATE).
    tracesSampleRate: Number(
        process.env.SENTRY_TRACES_SAMPLE_RATE ??
            (process.env.NODE_ENV === "production" ? 0.1 : 1),
    ),

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
});
