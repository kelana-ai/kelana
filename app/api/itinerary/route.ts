import { headers } from "next/headers"

import { runModel } from "@/app/itinerary/generation"
import { submit } from "@/app/itinerary/new/submit"
import { verifyCaptcha } from "@/lib/captcha"
import { createClient } from "@/utils/supabase/server"
import { streamResponse } from "./stream"

export const maxDuration = 300

const MAX_BYTES = 20_000

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return new Response(null, { status: 415 })

  const text = await request.text()
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 })

  let input: unknown
  try {
    input = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim()
  return streamResponse((onPartial) =>
    submit(
      {
        getSupabase: createClient,
        generate: (prompt) => runModel(prompt, onPartial),
        verifyCaptcha: (token) => verifyCaptcha({ token, secret: process.env.TURNSTILE_SECRET_KEY, ip }),
      },
      input,
    ),
  )
}
