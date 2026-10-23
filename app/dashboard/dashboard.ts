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
} from "@/lib/dashboard"
import { listBudgetByType, listDashboardItineraries, listDaysBetween, listPlannedActivities } from "@/lib/data/dashboard"
import { effectiveStatus, toDateKey } from "@/lib/itinerary"

export type DashboardResult = { data: DashboardData | null; error: Error | null }

async function loadUpcoming(supabase: SupabaseClient, from: string, to: string) {
  const days = await listDaysBetween(supabase, from, to)
  if (!days.length) return upcomingActivities([], [])
  return upcomingActivities(days, await listPlannedActivities(supabase, days.map((day) => day.id)))
}

export async function loadDashboard(getSupabase: () => Promise<SupabaseClient>, now = new Date()): Promise<DashboardResult> {
  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error("Not authenticated") }

    const today = toDateKey(now)
    const window = upcomingWindow(now)
    const [stored, upcoming, costs] = await Promise.all([
      listDashboardItineraries(supabase, user.id),
      loadUpcoming(supabase, window.from, window.to),
      listBudgetByType(supabase),
    ])
    const itineraries = stored.map((itn) => ({ ...itn, status: effectiveStatus(itn.status, itn.date_to, today) }))

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
