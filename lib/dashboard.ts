import { formatDistance } from "date-fns"

import { formatDateKey, toDateKey } from "./itinerary"

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

export interface DashboardItinerary {
  id: string
  name: string
  destination_name: string
  status: string
  date_from: string
  date_to: string
  budget: { total?: number; spent?: number } | null
  carbon_metrics: { saved?: number } | null
  icon: string | null
  created_at: string
  updated_at: string | null
}

export interface UpcomingDay {
  id: string
  itinerary_id: string
  date: string
}

export interface UpcomingActivity {
  id: string
  day_id: string
  title: string
  start_time: string
  type: string
}

const UPCOMING_DAYS = 7
const UPCOMING_LIMIT = 10
const AFTER_ALL_DAYS = "9999-12-31"
const isActive = (status: string) => status === "confirmed" || status === "planning"
const saved = (itn: DashboardItinerary) => itn.carbon_metrics?.saved || 0

export function upcomingWindow(now: Date) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + UPCOMING_DAYS)
  return { from: toDateKey(now), to: toDateKey(end) }
}

export function dashboardStats(list: DashboardItinerary[]): DashboardData["stats"] {
  const carbonSaved = list.reduce((total, itn) => total + saved(itn), 0)
  const budgetTotal = list.reduce((total, itn) => total + (itn.budget?.total || 0), 0)
  const budgetLeft = list.reduce(
    (total, itn) => (isActive(itn.status) ? total + ((itn.budget?.total || 0) - (itn.budget?.spent || 0)) : total),
    0,
  )

  return {
    activeTrips: list.filter((itn) => isActive(itn.status)).length,
    totalTrips: list.length,
    carbonSaved,
    carbonProgress: Math.min(100, carbonSaved / 10),
    budgetLeft,
    budgetProgress: budgetTotal > 0 ? Math.min(100, (budgetLeft / budgetTotal) * 100) : 0,
  }
}

export function recentItineraries(list: DashboardItinerary[], now: Date): DashboardData["recentItineraries"] {
  return list.slice(0, 4).map((itn) => ({
    id: itn.id,
    name: itn.name,
    destination: itn.destination_name,
    dates: `${formatDateKey(itn.date_from)} - ${formatDateKey(itn.date_to)}`,
    status: itn.status,
    lastUpdated: formatDistance(new Date(itn.updated_at || itn.created_at), now, { addSuffix: true }),
    icon: `/places/${itn.icon}.png`,
  }))
}

export function carbonByMonth(list: DashboardItinerary[], now: Date): DashboardData["analytics"]["carbonData"] {
  return Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const carbon = list
      .filter((itn) => {
        const created = new Date(itn.created_at)
        return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth()
      })
      .reduce((total, itn) => total + saved(itn), 0)
    return { name: month.toLocaleString("en-US", { month: "short" }), carbon }
  })
}

export function budgetAllocation(rows: Array<{ type: string; cost: number | string | null }>): DashboardData["analytics"]["budgetData"] {
  const totals: Record<string, number> = { Accommodation: 0, Transportation: 0, Food: 0, Activities: 0 }
  for (const row of rows) {
    const cost = Number(row.cost) || 0
    if (row.type === "accommodation") totals.Accommodation += cost
    else if (row.type === "transportation") totals.Transportation += cost
    else if (row.type === "food" || row.type === "drink") totals.Food += cost
    else totals.Activities += cost
  }
  const total = Object.values(totals).reduce((a, b) => a + b, 0)
  return Object.entries(totals).map(([name, value]) => ({
    name,
    value: total > 0 ? Math.round((value / total) * 100) : 0,
  }))
}

export function ecoSummary(carbonSaved: number, tripCount: number) {
  const ecoScore = tripCount > 0 ? Math.min(100, Math.round(carbonSaved / tripCount / 10)) : 0
  if (ecoScore >= 80) return { ecoScore, ecoRating: "Excellent", ecoMessage: "Your plans show large estimated savings" }
  if (ecoScore >= 60) return { ecoScore, ecoRating: "Very Good", ecoMessage: "Your plans show strong estimated savings" }
  if (ecoScore >= 40) return { ecoScore, ecoRating: "Good", ecoMessage: "You're on the right track to greener travel" }
  if (ecoScore > 0) {
    return { ecoScore, ecoRating: "Getting Started", ecoMessage: "Try rail or bus options to raise your estimated savings" }
  }
  return { ecoScore, ecoRating: "No data", ecoMessage: "" }
}

export function destinationImpact(list: DashboardItinerary[]): DashboardData["analytics"]["destinationData"] {
  return Array.from(new Set(list.map((itn) => itn.destination_name)))
    .slice(0, 4)
    .map((destination) => ({
      name: destination,
      impact: list.filter((itn) => itn.destination_name === destination).reduce((total, itn) => total + saved(itn), 0),
    }))
}

export function upcomingActivities(days: UpcomingDay[], activities: UpcomingActivity[]): DashboardData["upcomingActivities"] {
  const dayById = new Map(days.map((day) => [day.id, day]))
  return activities
    .map((activity) => ({ activity, day: dayById.get(activity.day_id) }))
    .sort(
      (a, b) =>
        (a.day?.date ?? AFTER_ALL_DAYS).localeCompare(b.day?.date ?? AFTER_ALL_DAYS) ||
        a.activity.start_time.localeCompare(b.activity.start_time) ||
        a.activity.title.localeCompare(b.activity.title) ||
        a.activity.id.localeCompare(b.activity.id),
    )
    .slice(0, UPCOMING_LIMIT)
    .map(({ activity, day }) => ({
      id: activity.id,
      title: activity.title,
      date: day?.date ? formatDateKey(day.date) : "",
      time: activity.start_time,
      type: activity.type,
      itineraryId: day?.itinerary_id ?? "",
    }))
}
