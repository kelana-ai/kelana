import { sentryOptions } from "@/lib/sentry"

// the SDK is only downloaded when a DSN was set at build time
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("@sentry/nextjs").then((Sentry) => Sentry.init(sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN)))
}
