interface CspOptions {
  supabaseUrl?: string
  development?: boolean
  preview?: boolean
  enforce?: boolean
}

export interface CspViolation {
  directive: string
  blocked: string
  page: string
}

const TILES = "https://*.tile.openstreetmap.org"
const NOMINATIM = "https://nominatim.openstreetmap.org"
const VERCEL_TOOLBAR = "https://vercel.live"

function supabaseOrigins(url: string | undefined) {
  if (!url) return { http: [], socket: [] }
  try {
    const { origin, host } = new URL(url)
    return { http: [origin], socket: [`wss://${host}`] }
  } catch {
    return { http: [], socket: [] }
  }
}

export function buildCsp({ supabaseUrl, development = false, preview = false, enforce = false }: CspOptions = {}) {
  const supabase = supabaseOrigins(supabaseUrl)
  const toolbar = preview ? [VERCEL_TOOLBAR] : []

  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : []), ...toolbar]],
    ["style-src", ["'self'", "'unsafe-inline'", ...toolbar]],
    ["img-src", ["'self'", "data:", "blob:", TILES, ...supabase.http, ...toolbar]],
    ["font-src", ["'self'", "data:", ...toolbar]],
    ["connect-src", ["'self'", NOMINATIM, ...supabase.http, ...supabase.socket, ...(development ? ["ws://localhost:*"] : []), ...toolbar]],
    ["frame-src", [...toolbar]],
    ["frame-ancestors", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["object-src", ["'none'"]],
    ["worker-src", ["'self'", "blob:"]],
    ["manifest-src", ["'self'"]],
    ["report-uri", ["/api/csp-report"]],
    ["report-to", ["csp"]],
  ]

  const lines = directives.filter(([, values]) => values.length > 0).map(([name, values]) => `${name} ${values.join(" ")}`)
  if (enforce && !development) lines.push("upgrade-insecure-requests")
  return lines.join("; ")
}

const originOf = (value: unknown) => {
  if (typeof value !== "string" || !value) return "unknown"
  if (!/^https?:\/\//.test(value)) return value.length <= 20 ? value : "other"
  try {
    return new URL(value).origin
  } catch {
    return "other"
  }
}

const pathOf = (value: unknown) => {
  if (typeof value !== "string") return "unknown"
  try {
    return new URL(value).pathname
  } catch {
    return "unknown"
  }
}

const normalize = (report: Record<string, unknown>): CspViolation => ({
  directive: String(report["effective-directive"] ?? report.effectiveDirective ?? report["violated-directive"] ?? "unknown").slice(0, 40),
  blocked: originOf(report["blocked-uri"] ?? report.blockedURL),
  page: pathOf(report["document-uri"] ?? report.documentURL),
})

export function violationsOf(body: unknown): CspViolation[] {
  const reports = Array.isArray(body) ? body : [body]
  return reports
    .slice(0, 10)
    .flatMap((report): CspViolation[] => {
      if (!report || typeof report !== "object") return []
      const entry = report as Record<string, unknown>
      if (entry["csp-report"] && typeof entry["csp-report"] === "object") return [normalize(entry["csp-report"] as Record<string, unknown>)]
      if (entry.type === "csp-violation" && entry.body && typeof entry.body === "object") return [normalize(entry.body as Record<string, unknown>)]
      return []
    })
}
