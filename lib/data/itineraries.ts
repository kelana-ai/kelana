import type { SupabaseClient } from "@supabase/supabase-js"

import type { CleanItinerary } from "@/lib/itinerary"
import type { Itinerary } from "@/lib/itinerary-filters"
import type { ItineraryRow } from "@/lib/itinerary-view"

const LIST_COLUMNS =
  "id, name, description, status, destination_name, date_from, date_to, travel_type, budget, carbon_metrics, created_at, updated_at, user_id"

const DETAIL_COLUMNS = `
  id, name, description, status,
  destination_name, destination_lat, destination_lng,
  date_from, date_to,
  travel_type, travel_styles, dietary_needs,
  budget, carbon_metrics,
  itinerary_days (
    id, day_index, date,
    itinerary_activities (
      id, activity_index, start_time, end_time, title, description,
      type, status, location_name, location_lat, location_lng, address,
      cost, currency, eco_tags
    )
  )
`

const PLAN_COLUMNS = `id, name, destination_name, travel_type, travel_styles, dietary_needs, budget,
         itinerary_days ( date, day_index, itinerary_activities (
           start_time, end_time, title, description, type, location_name, location_lat, location_lng,
           address, cost, eco_tags, activity_index ) )`

export interface ItineraryListRow {
  id: string
  name: string
  description: string | null
  status: string
  destination_name: string
  date_from: string
  date_to: string
  travel_type: string
  budget: { total?: number } | null
  carbon_metrics: { saved?: number; percentage?: number } | null
  created_at: string
  updated_at: string | null
  user_id: string
}

export function toListItem(row: ItineraryListRow): Itinerary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    destination: row.destination_name,
    start_date: row.date_from,
    end_date: row.date_to,
    status: row.status as Itinerary["status"],
    carbon_saved: row.carbon_metrics?.saved || 0,
    carbon_percentage: row.carbon_metrics?.percentage || 0,
    budget_total: row.budget?.total || 0,
    travel_type: row.travel_type,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    user_id: row.user_id,
  }
}

export async function listItineraries(supabase: SupabaseClient): Promise<Itinerary[]> {
  const { data, error } = await supabase.from("itineraries").select(LIST_COLUMNS).order("created_at", { ascending: false })
  if (error) throw error
  return ((data ?? []) as ItineraryListRow[]).map(toListItem)
}

export async function getItinerary(supabase: SupabaseClient, id: string): Promise<ItineraryRow | null> {
  // RLS limits this to the owner; anyone else gets no row
  const { data, error } = await supabase.from("itineraries").select(DETAIL_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return data as ItineraryRow | null
}

export interface ItineraryTitle {
  id: string
  name: string
  destination_name: string
}

export async function getItineraryTitle(supabase: SupabaseClient, id: string): Promise<ItineraryTitle | null> {
  const { data, error } = await supabase.from("itineraries").select("id, name, destination_name").eq("id", id).maybeSingle()
  if (error) throw error
  return data
}

export async function removeItinerary(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await supabase.from("itineraries").delete().eq("id", id).select("id")
  if (error) throw error
  return Boolean(data?.length)
}

// a failed count reads as zero so that it can never block a request
export async function countItinerariesSince(supabase: SupabaseClient, since: string): Promise<number> {
  const { count } = await supabase.from("itineraries").select("id", { count: "exact", head: true }).gte("created_at", since)
  return count ?? 0
}

export interface PlanActivity {
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

export interface PlanDay {
  date: string
  day_index: number
  itinerary_activities: PlanActivity[]
}

export interface PlanRow {
  id: string
  name: string
  destination_name: string
  travel_type: string
  travel_styles: string[]
  dietary_needs: string[]
  budget: { total?: number } | null
  itinerary_days: PlanDay[]
}

export async function getPlan(supabase: SupabaseClient, id: string): Promise<PlanRow | null> {
  const { data, error } = await supabase.from("itineraries").select(PLAN_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return data as PlanRow | null
}

export interface ItineraryMeta {
  userId: string
  description: string
  destinationName: string
  destinationLat: number
  destinationLng: number
  dateFrom: string
  dateTo: string
  travelType: string
  travelStyles: string[]
  dietaryNeeds: string[]
}

type CleanActivity = CleanItinerary["days"][number]["activities"][number]

function activityRow(a: CleanActivity, index: number) {
  return {
    activity_index: index,
    start_time: a.start_time,
    end_time: a.end_time,
    title: a.title,
    description: a.description,
    type: a.type,
    status: "planned" as const,
    location_name: a.location?.name ?? null,
    location_lat: a.location?.lat ?? null,
    location_lng: a.location?.lng ?? null,
    address: a.location?.address ?? null,
    cost: a.cost,
    currency: "USD",
    eco_tags: [a.eco_tag],
  }
}

export function activityRows(dayId: string, activities: CleanActivity[]) {
  return activities.map((a, j) => ({ day_id: dayId, ...activityRow(a, j) }))
}

export async function saveItinerary(supabase: SupabaseClient, meta: ItineraryMeta, data: CleanItinerary): Promise<string> {
  const { data: itn, error } = await supabase
    .from("itineraries")
    .insert({
      user_id: meta.userId,
      name: data.name,
      description: meta.description,
      status: "confirmed",
      destination_name: meta.destinationName,
      destination_lat: meta.destinationLat,
      destination_lng: meta.destinationLng,
      date_from: meta.dateFrom,
      date_to: meta.dateTo,
      travel_type: meta.travelType,
      travel_styles: meta.travelStyles,
      dietary_needs: meta.dietaryNeeds,
      budget: data.budget,
      carbon_metrics: data.carbon,
      icon: data.icon,
    })
    .select("id")
    .single()
  if (error || !itn) throw error ?? new Error("Failed to insert itinerary")

  try {
    await insertDays(supabase, itn.id, data.days)
  } catch (err) {
    await supabase.from("itineraries").delete().eq("id", itn.id)
    throw err
  }
  return itn.id
}

export async function insertDays(supabase: SupabaseClient, itineraryId: string, days: CleanItinerary["days"]) {
  const { data: dayRows, error: dayErr } = await supabase
    .from("itinerary_days")
    .insert(days.map((d, i) => ({ itinerary_id: itineraryId, day_index: i, date: d.date })))
    .select("id, day_index")
  if (dayErr || !dayRows) throw dayErr ?? new Error("Failed to insert days")

  const rows = dayRows.flatMap((row) => activityRows(row.id, days[row.day_index].activities))
  if (rows.length) {
    const { error } = await supabase.from("itinerary_activities").insert(rows)
    if (error) throw error
  }
}

export async function replacePlan(
  supabase: SupabaseClient,
  itineraryId: string,
  days: CleanItinerary["days"],
  totals: Pick<CleanItinerary, "budget" | "carbon">,
) {
  const { error } = await supabase.rpc("replace_itinerary_plan", {
    p_itinerary_id: itineraryId,
    p_days: days.map((d, i) => ({ day_index: i, date: d.date, activities: d.activities.map(activityRow) })),
    p_budget: totals.budget,
    p_carbon: totals.carbon,
  })
  if (error) throw error
}
