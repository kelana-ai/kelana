export function reportClientError(error: unknown, context: string) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error, { tags: { context } }))
}
