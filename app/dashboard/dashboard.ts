import type { SupabaseClient } from "@supabase/supabase-js"

import {
  budgetAllocation,
  carbonByMonth,
  dashboardStats,
  destinationImpact,
  ecoSummary,
  recentItineraries,
  upcomingActivities,
  upcomingWindow,
  type DashboardData,
  type DashboardItinerary,
  type UpcomingActivity,
  type UpcomingDay,
} from "@/lib/dashboard"
import { effectiveStatus, toDateKey } from "@/lib/itinerary"

export type DashboardResult = { data: DashboardData | null; error: Error | null }

async function loadItineraries(supabase: SupabaseClient, userId: string): Promise<DashboardItinerary[]> {
  const { data, error } = await supabase
    .from("itineraries")
    .select("id, name, destination_name, status, date_from, date_to, budget, carbon_metrics, icon, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

async function loadUpcoming(supabase: SupabaseClient, from: string, to: string) {
  const { data: days, error: daysError } = await supabase
    .from("itinerary_days")
    .select("id, itinerary_id, date")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
  if (daysError) throw daysError
  if (!days?.length) return upcomingActivities([], [])

  const { data: activities, error } = await supabase
    .from("itinerary_activities")
    .select("id, day_id, title, start_time, type, status")
    .in("day_id", (days as UpcomingDay[]).map((day) => day.id))
    .eq("status", "planned")
    .order("start_time", { ascending: true })
  if (error) throw error
  return upcomingActivities(days as UpcomingDay[], (activities ?? []) as UpcomingActivity[])
}

async function loadCosts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("itinerary_activities").select("type, cost").limit(5000)
  if (error) throw error
  return data ?? []
}

export async function loadDashboard(getSupabase: () => Promise<SupabaseClient>, now = new Date()): Promise<DashboardResult> {
  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error("Not authenticated") }

    const today = toDateKey(now)
    const itineraries = (await loadItineraries(supabase, user.id)).map((itn) => ({
      ...itn,
      status: effectiveStatus(itn.status, itn.date_to, today),
    }))
    const window = upcomingWindow(now)
    const upcoming = await loadUpcoming(supabase, window.from, window.to)
    const costs = await loadCosts(supabase)

    const stats = dashboardStats(itineraries)
    return {
      data: {
        stats,
        recentItineraries: recentItineraries(itineraries, now),
        analytics: {
          carbonData: carbonByMonth(itineraries, now),
          budgetData: budgetAllocation(costs),
          ...ecoSummary(stats.carbonSaved, itineraries.length),
          destinationData: destinationImpact(itineraries),
        },
        upcomingActivities: upcoming,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return { data: null, error: error instanceof Error ? error : new Error("An unknown error occurred") }
  }
}
