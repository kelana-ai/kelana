import type { SupabaseClient } from "@supabase/supabase-js"

import type { DashboardItinerary, UpcomingActivity, UpcomingDay } from "@/lib/dashboard"

export async function listDashboardItineraries(supabase: SupabaseClient, userId: string): Promise<DashboardItinerary[]> {
  const { data, error } = await supabase
    .from("itineraries")
    .select("id, name, destination_name, status, date_from, date_to, budget, carbon_metrics, icon, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listDaysBetween(supabase: SupabaseClient, from: string, to: string): Promise<UpcomingDay[]> {
  const { data, error } = await supabase
    .from("itinerary_days")
    .select("id, itinerary_id, date")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listPlannedActivities(supabase: SupabaseClient, dayIds: string[]): Promise<UpcomingActivity[]> {
  const { data, error } = await supabase
    .from("itinerary_activities")
    .select("id, day_id, title, start_time, type, status")
    .in("day_id", dayIds)
    .eq("status", "planned")
    .order("start_time", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listActivityCosts(supabase: SupabaseClient): Promise<{ type: string; cost: number | string | null }[]> {
  const { data, error } = await supabase.from("itinerary_activities").select("type, cost").limit(5000)
  if (error) throw error
  return data ?? []
}
