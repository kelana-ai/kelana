import type { ErrorEvent } from "@sentry/nextjs"
import { afterEach, describe, expect, it, vi } from "vitest"

import { scrubEvent, sentryOptions } from "./sentry"

const event = (patch: Record<string, unknown> = {}) => ({ type: undefined, ...patch }) as ErrorEvent

describe("scrubEvent", () => {
  it("drops the user, the extra data, the breadcrumbs and the host name", () => {
    const scrubbed = scrubEvent(
      event({ server_name: "strix", user: { email: "ayu@example.com", ip_address: "1.2.3.4" }, extra: { prompt: "Honeymoon in Villa Rahasia" }, breadcrumbs: [{ message: "fetch /search?q=Ubud" }] }),
    )

    expect(scrubbed).not.toHaveProperty("user")
    expect(scrubbed).not.toHaveProperty("extra")
    expect(scrubbed).not.toHaveProperty("breadcrumbs")
    expect(scrubbed).not.toHaveProperty("server_name")
  })

  it("keeps only the method and the address without query string or fragment of the request", () => {
    const scrubbed = scrubEvent(
      event({
        request: {
          method: "POST",
          url: "https://kelana-eco.vercel.app/itinerary/new?destination=Villa%20Rahasia#top",
          headers: { cookie: "sb-auth-token=secret" },
          cookies: { a: "b" },
          data: "tripName=Secret",
          query_string: "destination=Villa",
        },
      }),
    )

    expect(scrubbed.request).toEqual({ method: "POST", url: "https://kelana-eco.vercel.app/itinerary/new" })
  })

  it("drops a request address that cannot be read", () => {
    expect(scrubEvent(event({ request: { url: "not a url" } })).request).toEqual({ method: undefined, url: undefined })
    expect(scrubEvent(event({ request: {} })).request).toEqual({ method: undefined, url: undefined })
  })

  it("hides email addresses in the message and in every exception", () => {
    const scrubbed = scrubEvent(
      event({
        message: "Could not email ayu.l+kelana@example.co.id today",
        exception: { values: [{ type: "Error", value: "denied for a@b.com and c@d.org" }, { type: "Error" }] },
      }),
    )

    expect(scrubbed.message).toBe("Could not email [email] today")
    expect(scrubbed.exception?.values).toEqual([{ type: "Error", value: "denied for [email] and [email]" }, { type: "Error", value: undefined }])
  })

  it("cuts long messages at 300 characters", () => {
    const scrubbed = scrubEvent(event({ message: "x".repeat(301), exception: { values: [{ value: "y".repeat(500) }] } }))

    expect(scrubbed.message).toHaveLength(300)
    expect(scrubbed.exception?.values?.[0].value).toHaveLength(300)
  })

  it("keeps the contexts about the browser, system and trace and drops the rest", () => {
    const scrubbed = scrubEvent(
      event({ contexts: { browser: { name: "Chrome" }, os: { name: "Linux" }, runtime: { name: "node" }, device: {}, trace: { trace_id: "abc" }, state: { state: { name: "Secret" } }, react: { componentStack: "at Wizard" } } }),
    )

    expect(Object.keys(scrubbed.contexts ?? {}).sort()).toEqual(["browser", "device", "os", "runtime", "trace"])
  })

  it("leaves an event without those parts as it is", () => {
    expect(scrubEvent(event({ level: "error" }))).toEqual(event({ level: "error" }))
  })

  it("does not change the event it was given", () => {
    const original = event({ user: { id: "1" }, message: "a@b.com" })
    scrubEvent(original)

    expect(original).toEqual(event({ user: { id: "1" }, message: "a@b.com" }))
  })
})

describe("sentryOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("stays off without a DSN", () => {
    expect(sentryOptions(undefined)).toMatchObject({ dsn: undefined, enabled: false })
    expect(sentryOptions("")).toMatchObject({ enabled: false })
  })

  it("turns on with a DSN and sends errors only", () => {
    const options = sentryOptions("https://key@o1.ingest.sentry.io/2")

    expect(options).toMatchObject({ dsn: "https://key@o1.ingest.sentry.io/2", enabled: true, sendDefaultPii: false, tracesSampleRate: 0, beforeSend: scrubEvent })
  })

  it("keeps no breadcrumbs", () => {
    expect(sentryOptions("https://key@o1.ingest.sentry.io/2").beforeBreadcrumb()).toBeNull()
  })

  it("names the environment after Vercel, or Node when it is not on Vercel", () => {
    vi.stubEnv("VERCEL_ENV", "preview")
    expect(sentryOptions(undefined).environment).toBe("preview")
    vi.stubEnv("VERCEL_ENV", "")
    vi.unstubAllEnvs()
    expect(sentryOptions(undefined).environment).toBe(process.env.NODE_ENV)
  })
})
