import { formatDateKey } from "./itinerary"

export interface ActivityRow {
  id: string
  activity_index: number
  start_time: string
  end_time: string | null
  title: string
  description: string
  type: string
  status: string
  location_name: string | null
  location_lat: number | null
  location_lng: number | null
  address: string | null
  cost: number
  currency: string
  eco_tags: string[]
}

export interface DayRow {
  id: string
  day_index: number
  date: string
  itinerary_activities: ActivityRow[]
}

export interface ItineraryRow {
  id: string
  name: string
  description: string
  status: string
  destination_name: string
  destination_lat: number
  destination_lng: number
  date_from: string
  date_to: string
  travel_type: string
  travel_styles: string[]
  dietary_needs: string[]
  budget: {
    total: number
    spent: number
    remaining: number
  }
  carbon_metrics: {
    saved: number
    total: number
    percentage: number
  }
  itinerary_days: DayRow[]
}

export function prepareDays(itineraryDays: DayRow[]) {
  return [...itineraryDays]
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      id: `day-${d.day_index + 1}`,
      rawDate: d.date,
      date: formatDateKey(d.date),
      activities: [...d.itinerary_activities].sort((a, b) => a.activity_index - b.activity_index),
    }))
}

export type PreparedDay = ReturnType<typeof prepareDays>[number]

export function mapActivitiesOf(days: PreparedDay[]) {
  return days
    .flatMap((day, dayIndex) =>
      day.activities.map((act) => ({
        title: act.title,
        description: act.description,
        time: act.start_time.slice(0, 5) + (act.end_time ? ` - ${act.end_time.slice(0, 5)}` : ""),
        eco_tag: act.eco_tags[0] || "",
        day: `Day ${dayIndex + 1}`,
        lat: act.location_lat,
        lng: act.location_lng,
      })),
    )
    .filter((a): a is typeof a & { lat: number; lng: number } => a.lat !== null && a.lng !== null)
    .map((a) => ({ ...a, lat: Number(a.lat), lng: Number(a.lng) }))
}

export function placesOf(days: PreparedDay[]) {
  return Array.from(
    new Map<string, { name: string; address: string }>(
      days
        .flatMap((d) => d.activities)
        .filter((act) => act.location_name && act.address)
        .map((act) => [act.location_name!, { name: act.location_name!, address: act.address! }]),
    ).values(),
  )
}

export const downloadFileName = (name: string) =>
  `${name.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "itinerary"}.txt`
