import * as Sentry from "@sentry/nextjs"

export function reportError(error: unknown, context: string) {
  Sentry.captureException(error, { tags: { context } })
}
