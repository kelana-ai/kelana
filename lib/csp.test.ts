import { describe, expect, it } from "vitest"

import { buildCsp, violationsOf } from "./csp"

const directive = (policy: string, name: string) => policy.split("; ").find((part) => part.startsWith(`${name} `))

describe("buildCsp", () => {
  const policy = buildCsp({ supabaseUrl: "https://project.supabase.co" })

  it("allows only the sources the app uses", () => {
    expect(directive(policy, "default-src")).toBe("default-src 'self'")
    expect(directive(policy, "img-src")).toBe("img-src 'self' data: blob: https://*.tile.openstreetmap.org https://project.supabase.co")
    expect(directive(policy, "connect-src")).toBe("connect-src 'self' https://nominatim.openstreetmap.org https://project.supabase.co wss://project.supabase.co")
    expect(directive(policy, "font-src")).toBe("font-src 'self' data:")
  })

  it("keeps inline scripts and styles, which Next.js and the components need", () => {
    expect(directive(policy, "script-src")).toBe("script-src 'self' 'unsafe-inline'")
    expect(directive(policy, "style-src")).toBe("style-src 'self' 'unsafe-inline'")
  })

  it("blocks plugins, framing by other sites, a different base and foreign form targets", () => {
    expect(directive(policy, "object-src")).toBe("object-src 'none'")
    expect(directive(policy, "frame-ancestors")).toBe("frame-ancestors 'self'")
    expect(directive(policy, "base-uri")).toBe("base-uri 'self'")
    expect(directive(policy, "form-action")).toBe("form-action 'self'")
    expect(directive(policy, "frame-src")).toBeUndefined()
  })

  it("reports violations to the endpoint of the app", () => {
    expect(directive(policy, "report-uri")).toBe("report-uri /api/csp-report")
    expect(directive(policy, "report-to")).toBe("report-to csp")
  })

  it("upgrades insecure requests only when asked to, and never in development", () => {
    expect(policy).not.toContain("upgrade-insecure-requests")
    expect(buildCsp({ upgradeInsecure: true }).endsWith("upgrade-insecure-requests")).toBe(true)
    expect(buildCsp({ upgradeInsecure: true, development: true })).not.toContain("upgrade-insecure-requests")
  })

  it("allows eval and local sockets in development only", () => {
    expect(policy).not.toContain("'unsafe-eval'")
    expect(policy).not.toContain("ws://localhost")
    const development = buildCsp({ development: true })
    expect(directive(development, "script-src")).toContain("'unsafe-eval'")
    expect(directive(development, "connect-src")).toContain("ws://localhost:*")
  })

  it("allows the Vercel toolbar on previews only", () => {
    expect(policy).not.toContain("vercel.live")
    expect(policy).not.toContain("pusher")
    const preview = buildCsp({ preview: true })
    for (const name of ["script-src", "style-src", "img-src", "font-src", "connect-src", "frame-src"]) expect(directive(preview, name)).toContain("https://vercel.live")
    expect(directive(preview, "connect-src")).toContain("wss://ws-us3.pusher.com")
    expect(directive(preview, "img-src")).toContain("https://vercel.com")
    expect(directive(preview, "font-src")).toContain("https://assets.vercel.com")
  })

  it("allows the ingest host of the Sentry DSN, and only the host", () => {
    const withSentry = buildCsp({ sentryDsn: "https://publickey@o123.ingest.sentry.io/456" })

    expect(directive(withSentry, "connect-src")).toBe("connect-src 'self' https://nominatim.openstreetmap.org https://o123.ingest.sentry.io")
    expect(withSentry).not.toContain("publickey")
    expect(directive(buildCsp({ sentryDsn: "not a url" }), "connect-src")).toBe("connect-src 'self' https://nominatim.openstreetmap.org")
    expect(directive(policy, "connect-src")).not.toContain("sentry")
  })

  it("allows the Turnstile challenge only when it is switched on", () => {
    expect(policy).not.toContain("challenges.cloudflare.com")
    const withChallenge = buildCsp({ turnstile: true })

    for (const name of ["script-src", "frame-src", "connect-src"]) expect(directive(withChallenge, name)).toContain("https://challenges.cloudflare.com")
    expect(directive(withChallenge, "img-src")).not.toContain("challenges.cloudflare.com")
  })

  it("copes with a missing or invalid project address", () => {
    expect(directive(buildCsp(), "connect-src")).toBe("connect-src 'self' https://nominatim.openstreetmap.org")
    expect(directive(buildCsp({ supabaseUrl: "not a url" }), "img-src")).toBe("img-src 'self' data: blob: https://*.tile.openstreetmap.org")
  })
})

describe("violationsOf", () => {
  it("reads the report-uri format", () => {
    const body = {
      "csp-report": {
        "document-uri": "https://kelana-eco.vercel.app/itinerary/abc?token=secret",
        "effective-directive": "img-src",
        "blocked-uri": "https://cdn.example.com/pic.png?x=1",
      },
    }
    expect(violationsOf(body)).toEqual([{ directive: "img-src", blocked: "https://cdn.example.com", page: "/itinerary/abc" }])
  })

  it("reads the Reporting API format, which is a list", () => {
    const body = [
      { type: "csp-violation", body: { documentURL: "https://kelana-eco.vercel.app/about", effectiveDirective: "script-src", blockedURL: "inline" } },
      { type: "deprecation", body: {} },
    ]
    expect(violationsOf(body)).toEqual([{ directive: "script-src", blocked: "inline", page: "/about" }])
  })

  it("keeps no query string, fragment or path of the blocked address", () => {
    const [violation] = violationsOf({ "csp-report": { "document-uri": "https://a.test/p?q=1#h", "blocked-uri": "https://b.test/secret/path?token=1#frag", "violated-directive": "connect-src" } })
    expect(JSON.stringify(violation)).not.toMatch(/token|secret|frag|q=1/)
  })

  it.each([null, undefined, "text", 42, [], {}, [null, "x"], { "csp-report": null }])("ignores %j", (body) => {
    expect(violationsOf(body)).toEqual([])
  })

  it("fills in what a report leaves out and shortens odd values", () => {
    expect(violationsOf({ "csp-report": {} })).toEqual([{ directive: "unknown", blocked: "unknown", page: "unknown" }])
    const [odd] = violationsOf({ "csp-report": { "blocked-uri": "x".repeat(50), "document-uri": "not a url", "effective-directive": "d".repeat(100) } })
    expect(odd).toEqual({ directive: "d".repeat(40), blocked: "other", page: "unknown" })
    expect(violationsOf({ "csp-report": { "blocked-uri": "https://" } })[0].blocked).toBe("other")
  })

  it("reads at most ten reports", () => {
    const body = Array.from({ length: 25 }, () => ({ type: "csp-violation", body: { effectiveDirective: "img-src" } }))
    expect(violationsOf(body)).toHaveLength(10)
  })
})

describe("buildCsp remaining directives", () => {
  const policy = buildCsp({ supabaseUrl: "https://project.supabase.co" })
  const part = (name: string) => policy.split("; ").find((item) => item.startsWith(`${name} `))

  it("limits workers and the manifest to the app", () => {
    expect(part("worker-src")).toBe("worker-src 'self' blob:")
    expect(part("manifest-src")).toBe("manifest-src 'self'")
  })

  it("adds no socket for a project address that cannot be read", () => {
    expect(buildCsp({ supabaseUrl: "not a url" }).split("; ").find((item) => item.startsWith("connect-src "))).toBe(
      "connect-src 'self' https://nominatim.openstreetmap.org",
    )
  })
})

describe("violationsOf details", () => {
  const report = (patch: Record<string, unknown>) => violationsOf({ "csp-report": { "document-uri": "https://a.test/page", "effective-directive": "img-src", ...patch } })[0]

  it("keeps a keyword as it is and shortens anything longer than 20 characters", () => {
    expect(report({ "blocked-uri": "inline" }).blocked).toBe("inline")
    expect(report({ "blocked-uri": "x".repeat(20) }).blocked).toBe("x".repeat(20))
    expect(report({ "blocked-uri": "x".repeat(21) }).blocked).toBe("other")
  })

  it("only reads an address when it starts with http or https", () => {
    expect(report({ "blocked-uri": "http://insecure.test/a.png" }).blocked).toBe("http://insecure.test")
    expect(report({ "blocked-uri": "https://secure.test/a.png" }).blocked).toBe("https://secure.test")
    expect(report({ "blocked-uri": "see https://evil.test/a" }).blocked).toBe("other")
    expect(report({ "blocked-uri": "ftp://files.test/a" }).blocked).toBe("ftp://files.test/a")
  })

  it("keeps a short text that only contains an address in the middle", () => {
    expect(report({ "blocked-uri": "see https://a.co" }).blocked).toBe("see https://a.co")
  })

  it("shortens an address it cannot parse", () => {
    expect(report({ "blocked-uri": "https://" }).blocked).toBe("other")
  })

  it("reports an unknown directive when the report names none", () => {
    expect(violationsOf({ "csp-report": { "blocked-uri": "inline" } })[0].directive).toBe("unknown")
  })

  it("falls back to the violated directive of the older format", () => {
    expect(violationsOf({ "csp-report": { "violated-directive": "script-src 'self'", "blocked-uri": "inline" } })[0].directive).toBe("script-src 'self'")
  })

  it("ignores a report whose body is not an object", () => {
    expect(violationsOf({ "csp-report": "oops" })).toEqual([])
    expect(violationsOf({ type: "csp-violation", body: "oops" })).toEqual([])
    expect(violationsOf([42, "text", true])).toEqual([])
  })
})
