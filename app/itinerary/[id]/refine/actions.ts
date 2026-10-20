"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/utils/supabase/server"
import { runModel } from "../../generation"
import { refine, type RefineResult } from "./refine"

export async function refineItinerary(input: unknown): Promise<RefineResult> {
  return refine({ getSupabase: createClient, generate: runModel, revalidate: revalidatePath }, input)
}
