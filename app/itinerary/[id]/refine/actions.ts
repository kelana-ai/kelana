"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { cleanGeneratedItinerary, sanitizeText, type ActivityType, type CleanItinerary } from "@/lib/itinerary"
import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/utils/supabase/server"
import { buildRefinePrompt, insertDays, runModel } from "../../generation"

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

export async function refineItinerary(input: unknown): Promise<RefineResult> {
  const parsed = Input.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." }
  const { itineraryId, instruction } = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Please sign in to refine an itinerary." }

    const limit = checkRateLimit(`refine:${user.id}`, 10, 3_600_000)
    if (!limit.ok) {
      return { success: false, error: `Too many refinements. Please try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` }
    }

    const { data: itn, error } = await supabase
      .from("itineraries")
      .select(
        `id, name, destination_name, travel_type, travel_styles, dietary_needs, budget,
         itinerary_days ( date, day_index, itinerary_activities (
           start_time, end_time, title, description, type, location_name, location_lat, location_lng,
           address, cost, eco_tags, activity_index ) )`,
      )
      .eq("id", itineraryId)
      .maybeSingle()
    if (error || !itn) return { success: false, error: "Itinerary not found." }

    const days = [...(itn.itinerary_days as { date: string; day_index: number; itinerary_activities: ActivityRow[] }[])].sort(
      (a, b) => a.day_index - b.day_index,
    )
    if (!days.length) return { success: false, error: "This itinerary has no days to refine." }
    const dayKeys = days.map((d) => d.date)
    const totalBudget = Number((itn.budget as { total?: number } | null)?.total ?? 0)

    const snapshot: CleanItinerary["days"] = days.map((d) => ({
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

    const current = {
      name: itn.name,
      destination: itn.destination_name,
      travelType: itn.travel_type,
      travelStyles: itn.travel_styles,
      dietaryNeeds: itn.dietary_needs,
      budgetUsd: totalBudget,
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

    const generated = await runModel(buildRefinePrompt(current, sanitizeText(instruction, 1000), dayKeys))
    const clean = cleanGeneratedItinerary(generated, dayKeys, totalBudget, itn.name)

    const { error: delErr } = await supabase.from("itinerary_days").delete().eq("itinerary_id", itineraryId)
    if (delErr) throw delErr
    try {
      await insertDays(supabase, itineraryId, clean.days)
    } catch (err) {
      await insertDays(supabase, itineraryId, snapshot).catch((restoreErr) =>
        console.error("Could not restore itinerary after failed refine:", restoreErr),
      )
      throw err
    }

    const { error: updErr } = await supabase
      .from("itineraries")
      .update({ budget: clean.budget, carbon_metrics: clean.carbon, updated_at: new Date().toISOString() })
      .eq("id", itineraryId)
    if (updErr) throw updErr

    revalidatePath(`/itinerary/${itineraryId}`)
    return { success: true }
  } catch (error) {
    console.error("Error refining itinerary:", error)
    return { success: false, error: "We couldn't refine your itinerary. Your original plan is unchanged." }
  }
}
