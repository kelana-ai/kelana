"use server"

import { headers } from "next/headers"

import { verifyCaptcha } from "@/lib/captcha"
import { createClient } from "@/utils/supabase/server"
import { runModel } from "../generation"
import { submit, type SubmitItineraryResult } from "./submit"

export async function submitItinerary(input: unknown): Promise<SubmitItineraryResult> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim()
  return submit(
    { getSupabase: createClient, generate: runModel, verifyCaptcha: (token) => verifyCaptcha({ token, secret: process.env.TURNSTILE_SECRET_KEY, ip }) },
    input,
  )
}
