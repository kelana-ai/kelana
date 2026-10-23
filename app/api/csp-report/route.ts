import { violationsOf } from "@/lib/csp"

const MAX_BYTES = 10_000

export async function POST(request: Request) {
  const text = await request.text()
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 })

  try {
    for (const violation of violationsOf(JSON.parse(text))) console.log(JSON.stringify({ event: "csp.violation", ...violation }))
  } catch {
    return new Response(null, { status: 400 })
  }
  return new Response(null, { status: 204 })
}
