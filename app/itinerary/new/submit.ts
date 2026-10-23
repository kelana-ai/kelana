import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import { cleanGeneratedItinerary, countTripDays, isDateKey, listTripDays, sanitizeText } from "@/lib/itinerary"
import { isEnabled, PAUSED_MESSAGE } from "@/lib/flags"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  DIETARY_NEED_IDS,
  MAX_BUDGET,
  MAX_TRIP_DAYS,
  MIN_BUDGET,
  TRAVEL_STYLE_IDS,
  TRAVEL_TYPES,
} from "@/lib/trip-options"
import { countItinerariesSince, saveItinerary } from "@/lib/data/itineraries"
import { saveTripDefaults } from "@/lib/data/profiles"
import { buildCreatePrompt } from "../generation"
import { runTraced, withTrace, type ModelRun, type Trace } from "../trace"

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
  generate: (prompt: string) => Promise<ModelRun>
}

const HOURLY_LIMIT = 5
const DAILY_LIMIT = 20

type Trip = z.infer<typeof ItineraryInput>

async function limitError(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const memory = checkRateLimit(`create:${userId}`, HOURLY_LIMIT, 3_600_000)
  if (!memory.ok) {
    return `You've created several itineraries recently. Please try again in ${Math.ceil(memory.retryAfterSec / 60)} minutes.`
  }
  const since = new Date(Date.now() - 86_400_000).toISOString()
  return (await countItinerariesSince(supabase, since)) >= DAILY_LIMIT ? "Daily itinerary limit reached. Please try again tomorrow." : null
}

function homeOf(trip: Trip) {
  const home = trip.homeLocation
  return home?.lat !== undefined && home?.lng !== undefined ? { ...home, lat: home.lat, lng: home.lng } : undefined
}

type Home = NonNullable<ReturnType<typeof homeOf>>

function modelRequest(trip: Trip, home: Home | undefined) {
  return {
    tripName: sanitizeText(trip.tripName, 100),
    destination: { ...trip.destination, name: sanitizeText(trip.destination.name, 300) },
    homeLocation: home ? { ...home, name: sanitizeText(home.name, 300) } : null,
    travelType: trip.travelType,
    travelStyles: trip.travelStyles,
    dietaryNeeds: trip.dietaryNeeds,
    budgetUsd: trip.budget,
  }
}

function itineraryMeta(userId: string, trip: Trip, destination: string) {
  return {
    userId,
    description: `Eco-friendly itinerary to ${sanitizeText(trip.destination.name, 120)}`,
    destinationName: destination || trip.destination.name,
    destinationLat: trip.destination.lat,
    destinationLng: trip.destination.lng,
    dateFrom: trip.dateFrom,
    dateTo: trip.dateTo,
    travelType: trip.travelType,
    travelStyles: trip.travelStyles,
    dietaryNeeds: trip.dietaryNeeds,
  }
}

async function saveHomeDefaults(supabase: SupabaseClient, userId: string, home: Home, trip: Trip) {
  await saveTripDefaults(supabase, userId, {
    homeLat: home.lat,
    homeLng: home.lng,
    travelStyles: trip.travelStyles,
    dietaryNeeds: trip.dietaryNeeds,
  }).catch((error: Error) => console.error("Could not save profile defaults:", error.message))
}

async function create({ getSupabase, generate }: SubmitDeps, input: unknown, trace: Trace): Promise<SubmitItineraryResult> {
  const parsed = ItineraryInput.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid trip details." }
  }
  const trip = parsed.data
  if (!isEnabled("generation")) return { success: false, error: PAUSED_MESSAGE }

  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Please sign in to create an itinerary." }

    const blocked = await limitError(supabase, user.id)
    if (blocked) return { success: false, error: blocked }

    const dayKeys = listTripDays(trip.dateFrom, trip.dateTo)
    trace.days = dayKeys.length
    const home = homeOf(trip)

    const generated = await runTraced(trace, generate, buildCreatePrompt(modelRequest(trip, home), dayKeys))
    const clean = cleanGeneratedItinerary(generated, dayKeys, trip.budget, trip.tripName)

    const itineraryId = await saveItinerary(supabase, itineraryMeta(user.id, trip, clean.destination), clean)
    if (home) await saveHomeDefaults(supabase, user.id, home, trip)

    return { success: true, itineraryId }
  } catch (error) {
    trace.outcome = "error"
    console.error("Error creating itinerary:", error)
    return { success: false, error: "We couldn't generate your itinerary. Please try again." }
  }
}

export function submit(deps: SubmitDeps, input: unknown) {
  return withTrace("create", (trace) => create(deps, input, trace))
}
