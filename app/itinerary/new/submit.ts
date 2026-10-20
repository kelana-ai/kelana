import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import {
  cleanGeneratedItinerary,
  countTripDays,
  isDateKey,
  listTripDays,
  sanitizeText,
  type GeneratedItinerary,
} from "@/lib/itinerary"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  DIETARY_NEED_IDS,
  MAX_BUDGET,
  MAX_TRIP_DAYS,
  MIN_BUDGET,
  TRAVEL_STYLE_IDS,
  TRAVEL_TYPES,
} from "@/lib/trip-options"
import { buildCreatePrompt, saveItinerary } from "../generation"

const dateKey = z.string().refine(isDateKey, "Invalid date")

const ItineraryInput = z
  .object({
    tripName: z.string().trim().min(2).max(100),
    destination: z.object({
      name: z.string().trim().min(2).max(300),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    homeLocation: z
      .object({
        name: z.string().max(300).optional(),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
      .optional(),
    dateFrom: dateKey,
    dateTo: dateKey,
    travelType: z.enum(TRAVEL_TYPES),
    travelStyles: z.array(z.enum(TRAVEL_STYLE_IDS)).min(1).max(TRAVEL_STYLE_IDS.length),
    dietaryNeeds: z.array(z.enum(DIETARY_NEED_IDS)).max(DIETARY_NEED_IDS.length),
    budget: z.number().min(MIN_BUDGET).max(MAX_BUDGET),
  })
  .refine((v) => countTripDays(v.dateFrom, v.dateTo) >= 1, { message: "End date must not be before the start date." })
  .refine((v) => countTripDays(v.dateFrom, v.dateTo) <= MAX_TRIP_DAYS, {
    message: `Trips can be at most ${MAX_TRIP_DAYS} days long.`,
  })

export type SubmitItineraryResult = { success: true; itineraryId: string } | { success: false; error: string }

export interface SubmitDeps {
  getSupabase: () => Promise<SupabaseClient>
  generate: (prompt: string) => Promise<GeneratedItinerary>
}

const HOURLY_LIMIT = 5
const DAILY_LIMIT = 20

export async function submit({ getSupabase, generate }: SubmitDeps, input: unknown): Promise<SubmitItineraryResult> {
  const parsed = ItineraryInput.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid trip details." }
  }
  const trip = parsed.data

  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Please sign in to create an itinerary." }

    const memory = checkRateLimit(`create:${user.id}`, HOURLY_LIMIT, 3_600_000)
    if (!memory.ok) {
      return { success: false, error: `You've created several itineraries recently. Please try again in ${Math.ceil(memory.retryAfterSec / 60)} minutes.` }
    }
    const since = new Date(Date.now() - 86_400_000).toISOString()
    const { count } = await supabase
      .from("itineraries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
    if ((count ?? 0) >= DAILY_LIMIT) {
      return { success: false, error: "Daily itinerary limit reached. Please try again tomorrow." }
    }

    const dayKeys = listTripDays(trip.dateFrom, trip.dateTo)
    const home = trip.homeLocation?.lat !== undefined && trip.homeLocation?.lng !== undefined ? trip.homeLocation : undefined

    const generated = await generate(
      buildCreatePrompt(
        {
          tripName: sanitizeText(trip.tripName, 100),
          destination: { ...trip.destination, name: sanitizeText(trip.destination.name, 300) },
          homeLocation: home ? { ...home, name: sanitizeText(home.name, 300) } : null,
          travelType: trip.travelType,
          travelStyles: trip.travelStyles,
          dietaryNeeds: trip.dietaryNeeds,
          budgetUsd: trip.budget,
        },
        dayKeys,
      ),
    )
    const clean = cleanGeneratedItinerary(generated, dayKeys, trip.budget, trip.tripName)

    const itineraryId = await saveItinerary(
      supabase,
      {
        userId: user.id,
        description: `Eco-friendly itinerary to ${sanitizeText(trip.destination.name, 120)}`,
        destinationName: clean.destination || trip.destination.name,
        destinationLat: trip.destination.lat,
        destinationLng: trip.destination.lng,
        dateFrom: trip.dateFrom,
        dateTo: trip.dateTo,
        travelType: trip.travelType,
        travelStyles: trip.travelStyles,
        dietaryNeeds: trip.dietaryNeeds,
      },
      clean,
    )

    if (home) {
      const { error } = await supabase
        .from("profiles")
        .update({
          home_lat: home.lat,
          home_lng: home.lng,
          preferences: { travelStyles: trip.travelStyles },
          dietary_needs: trip.dietaryNeeds,
        })
        .eq("id", user.id)
      if (error) console.error("Could not save profile defaults:", error.message)
    }

    return { success: true, itineraryId }
  } catch (error) {
    console.error("Error creating itinerary:", error)
    return { success: false, error: "We couldn't generate your itinerary. Please try again." }
  }
}
