import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import {
  cleanGeneratedItinerary,
  sanitizeText,
  type ActivityType,
  type CleanItinerary,
  type GeneratedItinerary,
} from "@/lib/itinerary"
import { checkRateLimit } from "@/lib/rate-limit"
import { buildRefinePrompt, insertDays } from "../../generation"

const Input = z.object({
  itineraryId: z.uuid(),
  instruction: z.string().trim().min(5, "Describe the change you want (at least 5 characters).").max(1000),
})

export type RefineResult = { success: true } | { success: false; error: string }

type ActivityRow = {
  start_time: string
  end_time: string | null
  title: string
  description: string | null
  type: string
  location_name: string | null
  location_lat: number | null
  location_lng: number | null
  address: string | null
  cost: number
  eco_tags: string[]
  activity_index: number
}

export interface RefineDeps {
  getSupabase: () => Promise<SupabaseClient>
  generate: (prompt: string) => Promise<GeneratedItinerary>
  revalidate: (path: string) => void
}

type DayRow = { date: string; day_index: number; itinerary_activities: ActivityRow[] }

interface PlanHeader {
  name: string
  destination_name: string
  travel_type: string
  travel_styles: string[]
  dietary_needs: string[]
}

type Plan = { ok: true; itn: PlanHeader; days: DayRow[]; totalBudget: number } | { ok: false; error: string }

const SELECT_PLAN = `id, name, destination_name, travel_type, travel_styles, dietary_needs, budget,
         itinerary_days ( date, day_index, itinerary_activities (
           start_time, end_time, title, description, type, location_name, location_lat, location_lng,
           address, cost, eco_tags, activity_index ) )`

function snapshotOf(days: DayRow[]): CleanItinerary["days"] {
  return days.map((d) => ({
    date: d.date,
    activities: [...d.itinerary_activities]
      .sort((a, b) => a.activity_index - b.activity_index)
      .map((a) => ({
        start_time: a.start_time.slice(0, 5),
        end_time: a.end_time ? a.end_time.slice(0, 5) : null,
        title: a.title,
        description: a.description ?? "",
        type: a.type as ActivityType,
        eco_tag: a.eco_tags[0] ?? "Eco-friendly",
        cost: Number(a.cost),
        location:
          a.location_lat !== null && a.location_lng !== null
            ? { name: a.location_name ?? "", lat: Number(a.location_lat), lng: Number(a.location_lng), address: a.address ?? "" }
            : null,
      })),
  }))
}

function currentPlan(itn: PlanHeader, snapshot: CleanItinerary["days"], budgetUsd: number) {
  return {
    name: itn.name,
    destination: itn.destination_name,
    travelType: itn.travel_type,
    travelStyles: itn.travel_styles,
    dietaryNeeds: itn.dietary_needs,
    budgetUsd,
    days: snapshot.map((d) => ({
      date: d.date,
      activities: d.activities.map((a) => ({
        start_time: a.start_time,
        end_time: a.end_time,
        title: a.title,
        description: a.description,
        type: a.type,
        ecoTag: a.eco_tag,
        cost: a.cost,
        currency: "USD",
        location: a.location,
      })),
    })),
  }
}

async function loadPlan(supabase: SupabaseClient, itineraryId: string): Promise<Plan> {
  const { data: itn, error } = await supabase.from("itineraries").select(SELECT_PLAN).eq("id", itineraryId).maybeSingle()
  if (error || !itn) return { ok: false, error: "Itinerary not found." }

  const days = [...(itn.itinerary_days as DayRow[])].sort((a, b) => a.day_index - b.day_index)
  if (!days.length) return { ok: false, error: "This itinerary has no days to refine." }

  const totalBudget = Number((itn.budget as { total?: number } | null)?.total ?? 0)
  return { ok: true, itn, days, totalBudget }
}

async function replaceDays(supabase: SupabaseClient, itineraryId: string, days: CleanItinerary["days"], snapshot: CleanItinerary["days"]) {
  const { error: delErr } = await supabase.from("itinerary_days").delete().eq("itinerary_id", itineraryId)
  if (delErr) throw delErr
  try {
    await insertDays(supabase, itineraryId, days)
  } catch (err) {
    await insertDays(supabase, itineraryId, snapshot).catch((restoreErr) =>
      console.error("Could not restore itinerary after failed refine:", restoreErr),
    )
    throw err
  }
}

export async function refine({ getSupabase, generate, revalidate }: RefineDeps, input: unknown): Promise<RefineResult> {
  const parsed = Input.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." }
  const { itineraryId, instruction } = parsed.data

  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Please sign in to refine an itinerary." }

    const limit = checkRateLimit(`refine:${user.id}`, 10, 3_600_000)
    if (!limit.ok) {
      return { success: false, error: `Too many refinements. Please try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` }
    }

    const plan = await loadPlan(supabase, itineraryId)
    if (!plan.ok) return { success: false, error: plan.error }
    const { itn, days, totalBudget } = plan

    const dayKeys = days.map((d) => d.date)
    const snapshot = snapshotOf(days)
    const current = currentPlan(itn, snapshot, totalBudget)

    const generated = await generate(buildRefinePrompt(current, sanitizeText(instruction, 1000), dayKeys))
    const clean = cleanGeneratedItinerary(generated, dayKeys, totalBudget, itn.name)

    await replaceDays(supabase, itineraryId, clean.days, snapshot)

    const { error: updErr } = await supabase
      .from("itineraries")
      .update({ budget: clean.budget, carbon_metrics: clean.carbon, updated_at: new Date().toISOString() })
      .eq("id", itineraryId)
    if (updErr) throw updErr

    revalidate(`/itinerary/${itineraryId}`)
    return { success: true }
  } catch (error) {
    console.error("Error refining itinerary:", error)
    return { success: false, error: "We couldn't refine your itinerary. Your original plan is unchanged." }
  }
}
