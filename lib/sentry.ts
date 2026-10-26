import type { ErrorEvent } from "@sentry/nextjs"

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const MAX_TEXT = 300
const KEPT_CONTEXTS = new Set(["browser", "os", "runtime", "device", "trace"])

const scrubText = (value: string) => value.replace(EMAIL, "[email]").slice(0, MAX_TEXT)

function withoutQuery(url: string | undefined) {
  if (!url) return undefined
  try {
    const { origin, pathname } = new URL(url)
    return `${origin}${pathname}`
  } catch {
    return undefined
  }
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed = { ...event }
  delete scrubbed.user
  delete scrubbed.extra
  delete scrubbed.breadcrumbs
  delete scrubbed.server_name

  if (scrubbed.request) scrubbed.request = { method: scrubbed.request.method, url: withoutQuery(scrubbed.request.url) }
  if (scrubbed.message) scrubbed.message = scrubText(scrubbed.message)
  if (scrubbed.exception?.values) {
    scrubbed.exception = { values: scrubbed.exception.values.map((item) => ({ ...item, value: item.value === undefined ? undefined : scrubText(item.value) })) }
  }
  if (scrubbed.contexts) {
    scrubbed.contexts = Object.fromEntries(Object.entries(scrubbed.contexts).filter(([name]) => KEPT_CONTEXTS.has(name)))
  }
  return scrubbed
}

export function sentryOptions(dsn: string | undefined) {
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
    beforeBreadcrumb: () => null,
  }
}
