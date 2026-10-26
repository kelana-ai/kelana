import type { NextConfig } from "next"

import { buildCsp } from "./lib/csp"

const ENFORCE_CSP = true

const csp = buildCsp({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  development: process.env.NODE_ENV !== "production",
  preview: process.env.VERCEL_ENV === "preview",
  upgradeInsecure: Boolean(process.env.VERCEL),
  turnstile: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
})

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: ENFORCE_CSP ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: csp },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default async function config() {
  if (!process.env.SENTRY_AUTH_TOKEN) return nextConfig

  const { withSentryConfig } = await import("@sentry/nextjs/config")
  return withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    telemetry: false,
    sourcemaps: { deleteSourcemapsAfterUpload: true },
  })
}
