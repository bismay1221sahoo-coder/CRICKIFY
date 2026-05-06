import * as Sentry from "@sentry/node";

let sentryEnabled = false;

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });

  sentryEnabled = true;
};

export const captureException = (error, context = {}) => {
  if (!sentryEnabled) return;
  Sentry.captureException(error, { extra: context });
};
