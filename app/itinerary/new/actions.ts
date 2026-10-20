"use server"

import { createClient } from "@/utils/supabase/server"
import { runModel } from "../generation"
import { submit, type SubmitItineraryResult } from "./submit"

export async function submitItinerary(input: unknown): Promise<SubmitItineraryResult> {
  return submit({ getSupabase: createClient, generate: runModel }, input)
}
