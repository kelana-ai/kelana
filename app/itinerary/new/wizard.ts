import { format } from "date-fns"

import type { Profile } from "@/lib/data/profiles"
import { toDateKey } from "@/lib/itinerary"
import type { FormValues } from "./schema"

const FIELD_STEP: Record<string, number> = {
  tripName: 0,
  destination: 0,
  dateRange: 0,
  homeLocation: 1,
  travelType: 2,
  travelStyles: 3,
  dietaryNeeds: 4,
  budget: 5,
}

export function firstInvalidStep(fields: string[]) {
  return fields.length ? Math.min(...fields.map((field) => FIELD_STEP[field] ?? 0)) : 0
}

export function defaultTripDates(now = new Date()) {
  const to = new Date(now)
  to.setDate(to.getDate() + 7)
  return { from: new Date(now), to }
}

export function submission(data: FormValues, captchaToken?: string) {
  return {
    tripName: data.tripName,
    destination: data.destination,
    homeLocation: data.homeLocation?.lat !== undefined ? data.homeLocation : undefined,
    dateFrom: toDateKey(data.dateRange.from),
    dateTo: toDateKey(data.dateRange.to),
    travelType: data.travelType,
    travelStyles: data.travelStyles,
    dietaryNeeds: data.dietaryNeeds,
    budget: data.budget,
    captchaToken,
  }
}

interface DirtyFields {
  homeLocation?: unknown
  travelStyles?: unknown
  dietaryNeeds?: unknown
}

export function profileDefaults(profile: Profile, dirty: DirtyFields) {
  const values: Partial<Pick<FormValues, "homeLocation" | "travelStyles" | "dietaryNeeds">> = {}
  if (!dirty.homeLocation && profile.home_lat && profile.home_lng) {
    values.homeLocation = { name: "", lat: profile.home_lat, lng: profile.home_lng }
  }
  if (!dirty.travelStyles && profile.preferences?.travelStyles?.length) values.travelStyles = profile.preferences.travelStyles
  if (!dirty.dietaryNeeds && profile.dietary_needs?.length) values.dietaryNeeds = profile.dietary_needs
  return values
}

export function suggestedTripName(wanted: string) {
  return `${wanted.split(",")[0]} eco trip`
}

export function dateRangeLabel(range: { from?: Date; to?: Date } | undefined) {
  if (!range?.from) return null
  const from = format(range.from, "MMM d, yyyy")
  return range.to ? `${from} - ${format(range.to, "MMM d, yyyy")}` : from
}
