"use server"

import { createClient } from "@/utils/supabase/server"
import { formatDistanceToNow } from "date-fns"

import { effectiveStatus, formatDateKey, toDateKey } from "@/lib/itinerary"

export type DashboardData = {
  stats: {
    activeTrips: number
    totalTrips: number
    carbonSaved: number
    carbonProgress: number
    budgetLeft: number
    budgetProgress: number
  }
  recentItineraries: Array<{
    id: string
    name: string
    destination: string
    dates: string
    status: string
    lastUpdated: string
    icon?: string
  }>
  analytics: {
    carbonData: Array<{ name: string; carbon: number }>
    budgetData: Array<{ name: string; value: number }>
    ecoScore: number
    ecoRating: string
    ecoMessage: string
    destinationData: Array<{ name: string; impact: number }>
  }
  upcomingActivities: Array<{
    id: string
    title: string
    date: string
    time: string
    type: string
    itineraryId: string
  }>
}

export async function fetchDashboardData(): Promise<{ data: DashboardData | null; error: Error | null }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Not authenticated") }
    }

    const { data: itineraries, error: itinerariesError } = await supabase
      .from("itineraries")
      .select(
        "id, name, destination_name, status, date_from, date_to, budget, carbon_metrics, icon, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (itinerariesError) {
      throw itinerariesError
    }

    const today = toDateKey(new Date())
    const list = (itineraries ?? []).map((itn) => ({ ...itn, status: effectiveStatus(itn.status, itn.date_to, today) }))
    const isActive = (status: string) => status === "confirmed" || status === "planning"

    const activeTrips = list.filter((itn) => isActive(itn.status)).length
    const totalCarbonSaved = list.reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0)
    const totalBudgetTotal = list.reduce((total, itn) => total + (itn.budget?.total || 0), 0)
    const totalBudgetLeft = list.reduce(
      (total, itn) => (isActive(itn.status) ? total + ((itn.budget?.total || 0) - (itn.budget?.spent || 0)) : total),
      0,
    )

    const recentItineraries = list.slice(0, 4).map((itn) => ({
      id: itn.id,
      name: itn.name,
      destination: itn.destination_name,
      dates: `${formatDateKey(itn.date_from)} - ${formatDateKey(itn.date_to)}`,
      status: itn.status,
      lastUpdated: formatDistanceToNow(new Date(itn.updated_at || itn.created_at), { addSuffix: true }),
      icon: `/places/${itn.icon}.png`,
    }))

    const now = new Date()
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)

    const { data: days, error: daysError } = await supabase
      .from("itinerary_days")
      .select("id, itinerary_id, date")
      .gte("date", today)
      .lte("date", toDateKey(nextWeek))
      .order("date", { ascending: true })

    if (daysError) {
      throw daysError
    }

    let upcomingActivities: DashboardData["upcomingActivities"] = []

    if (days && days.length > 0) {
      const dayIds = days.map((day) => day.id)

      const { data: activities, error: activitiesError } = await supabase
        .from("itinerary_activities")
        .select("id, day_id, title, start_time, type, status")
        .in("day_id", dayIds)
        .eq("status", "planned")
        .order("start_time", { ascending: true })

      if (activitiesError) {
        throw activitiesError
      }

      upcomingActivities = (activities ?? [])
        .map((activity) => {
          const parentDay = days.find((day) => day.id === activity.day_id)
          return {
            id: activity.id,
            title: activity.title,
            date: parentDay?.date ? formatDateKey(parentDay.date) : "",
            time: activity.start_time,
            type: activity.type,
            itineraryId: parentDay?.itinerary_id ?? "",
          }
        })
        .slice(0, 10)
    }

    const carbonData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const carbon = list
        .filter((itn) => {
          const created = new Date(itn.created_at)
          return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth()
        })
        .reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0)
      return { name: month.toLocaleString("en-US", { month: "short" }), carbon }
    })

    const { data: costRows, error: costError } = await supabase.from("itinerary_activities").select("type, cost").limit(5000)
    if (costError) {
      throw costError
    }

    const categoryTotals: Record<string, number> = { Accommodation: 0, Transportation: 0, Food: 0, Activities: 0 }
    for (const row of costRows ?? []) {
      const cost = Number(row.cost) || 0
      if (row.type === "accommodation") categoryTotals.Accommodation += cost
      else if (row.type === "transportation") categoryTotals.Transportation += cost
      else if (row.type === "food" || row.type === "drink") categoryTotals.Food += cost
      else categoryTotals.Activities += cost
    }
    const costTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
    const budgetData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: costTotal > 0 ? Math.round((value / costTotal) * 100) : 0,
    }))

    const ecoScore = list.length > 0 ? Math.min(100, Math.round(totalCarbonSaved / list.length / 10)) : 0
    let ecoRating = "No data"
    let ecoMessage = ""
    if (ecoScore >= 80) {
      ecoRating = "Excellent"
      ecoMessage = "Your plans show large estimated savings"
    } else if (ecoScore >= 60) {
      ecoRating = "Very Good"
      ecoMessage = "Your plans show strong estimated savings"
    } else if (ecoScore >= 40) {
      ecoRating = "Good"
      ecoMessage = "You're on the right track to greener travel"
    } else if (ecoScore > 0) {
      ecoRating = "Getting Started"
      ecoMessage = "Try rail or bus options to raise your estimated savings"
    }

    const destinationData = Array.from(new Set(list.map((itn) => itn.destination_name)))
      .slice(0, 4)
      .map((destination) => ({
        name: destination,
        impact: list
          .filter((itn) => itn.destination_name === destination)
          .reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0),
      }))

    return {
      data: {
        stats: {
          activeTrips,
          totalTrips: list.length,
          carbonSaved: totalCarbonSaved,
          carbonProgress: Math.min(100, totalCarbonSaved / 10),
          budgetLeft: totalBudgetLeft,
          budgetProgress: totalBudgetTotal > 0 ? Math.min(100, (totalBudgetLeft / totalBudgetTotal) * 100) : 0,
        },
        recentItineraries,
        analytics: {
          carbonData,
          budgetData,
          ecoScore,
          ecoRating,
          ecoMessage,
          destinationData,
        },
        upcomingActivities,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("An unknown error occurred"),
    }
  }
}
