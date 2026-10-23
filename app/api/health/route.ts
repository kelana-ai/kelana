import { pingDatabase } from "@/lib/data/health"

export const dynamic = "force-dynamic"

const headers = { "cache-control": "no-store" }

export async function GET() {
  const database = await pingDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })

  if (!database.ok) return Response.json({ status: "error", database: "unreachable" }, { status: 503, headers })
  return Response.json({ status: "ok", database: "ok", latencyMs: database.latencyMs }, { headers })
}
