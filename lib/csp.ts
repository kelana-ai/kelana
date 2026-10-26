interface CspOptions {
  supabaseUrl?: string
  development?: boolean
  preview?: boolean
  upgradeInsecure?: boolean
}

export interface CspViolation {
  directive: string
  blocked: string
  page: string
}

const TILES = "https://*.tile.openstreetmap.org"
const NOMINATIM = "https://nominatim.openstreetmap.org"
const TOOLBAR = "https://vercel.live"

const NO_TOOLBAR = { script: [], style: [], img: [], font: [], connect: [], frame: [] }
const PREVIEW_TOOLBAR = {
  script: [TOOLBAR],
  style: [TOOLBAR],
  img: [TOOLBAR, "https://vercel.com"],
  font: [TOOLBAR, "https://assets.vercel.com"],
  connect: [TOOLBAR, "wss://ws-us3.pusher.com"],
  frame: [TOOLBAR],
}

function supabaseOrigins(url: string | undefined) {
  if (!url) return { http: [], socket: [] }
  try {
    const { origin, host } = new URL(url)
    return { http: [origin], socket: [`wss://${host}`] }
  } catch {
    return { http: [], socket: [] }
  }
}

export function buildCsp({ supabaseUrl, development = false, preview = false, upgradeInsecure = false }: CspOptions = {}) {
  const supabase = supabaseOrigins(supabaseUrl)
  const toolbar = preview ? PREVIEW_TOOLBAR : NO_TOOLBAR

  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : []), ...toolbar.script]],
    ["style-src", ["'self'", "'unsafe-inline'", ...toolbar.style]],
    ["img-src", ["'self'", "data:", "blob:", TILES, ...supabase.http, ...toolbar.img]],
    ["font-src", ["'self'", "data:", ...toolbar.font]],
    ["connect-src", ["'self'", NOMINATIM, ...supabase.http, ...supabase.socket, ...(development ? ["ws://localhost:*"] : []), ...toolbar.connect]],
    ["frame-src", toolbar.frame],
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
  if (upgradeInsecure && !development) lines.push("upgrade-insecure-requests")
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
