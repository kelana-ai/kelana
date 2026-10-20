import { format, parseISO } from "date-fns"

import { ACTIVITY_TYPES, ITINERARY_ICONS } from "./trip-options"

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

/** Formats a calendar date the user picked (local midnight) as `yyyy-MM-dd` without any timezone conversion. */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function isDateKey(value: string): boolean {
  const m = DATE_KEY.exec(value)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
}

function keyToUtc(key: string): number {
  const m = DATE_KEY.exec(key)
  if (!m) throw new Error(`Invalid date key: ${key}`)
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** Number of calendar days in the inclusive range, or 0 when the range is invalid or reversed. */
export function countTripDays(from: string, to: string): number {
  if (!isDateKey(from) || !isDateKey(to)) return 0
  const diff = Math.round((keyToUtc(to) - keyToUtc(from)) / 86_400_000)
  return diff < 0 ? 0 : diff + 1
}

/** Every `yyyy-MM-dd` key in the inclusive range, independent of the server timezone. */
export function listTripDays(from: string, to: string): string[] {
  const count = countTripDays(from, to)
  const start = count ? keyToUtc(from) : 0
  return Array.from({ length: count }, (_, i) => new Date(start + i * 86_400_000).toISOString().slice(0, 10))
}

/** Parses a date-only string (`yyyy-MM-dd`) at local midnight and formats it, so the day never shifts. */
export function formatDateKey(key: string, pattern = "MMM d, yyyy"): string {
  if (!isDateKey(key.slice(0, 10))) return key
  return format(parseISO(key.slice(0, 10)), pattern)
}

/** Accepts "09:00", "9:00", "9:00 AM", "21:30:00" and returns `HH:MM`, or null when unparseable. */
export function normalizeTime(raw: string | null | undefined): string | null {
  if (!raw) return null
  const m = /^\s*(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([AaPp][Mm])?\s*$/.exec(raw)
  if (!m) return null
  let hours = Number(m[1])
  const minutes = Number(m[2] ?? "0")
  const meridiem = m[3]?.toLowerCase()
  if (meridiem === "pm" && hours < 12) hours += 12
  if (meridiem === "am" && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

/** The database requires end_time > start_time; overnight or invalid ends are dropped instead of failing the insert. */
export function normalizeTimes(start: string, end: string | null | undefined): { start: string; end: string | null } {
  const s = normalizeTime(start) ?? "09:00"
  const e = normalizeTime(end)
  return { start: s, end: e && e > s ? e : null }
}

export function sanitizeText(value: string | null | undefined, max: number): string {
  return (value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").trim().slice(0, max)
}

export interface GeneratedActivity {
  start_time: string
  end_time: string | null
  title: string
  description: string
  type: string
  ecoTag: string
  cost: number
  currency: string
  location: { name: string; lat: number; lng: number; address: string } | null
}

export interface GeneratedItinerary {
  name: string
  destination: string
  days: { activities: GeneratedActivity[] }[]
  carbon: { saved: number; total: number; percentage: number }
  icon: string
}

export interface CleanActivity {
  start_time: string
  end_time: string | null
  title: string
  description: string
  type: ActivityType
  eco_tag: string
  cost: number
  location: { name: string; lat: number; lng: number; address: string } | null
}

export interface CleanItinerary {
  name: string
  destination: string
  days: { date: string; activities: CleanActivity[] }[]
  budget: { total: number; spent: number; remaining: number }
  carbon: { saved: number; total: number; percentage: number }
  icon: string
}

const finite = (n: unknown, fallback = 0) => (typeof n === "number" && Number.isFinite(n) ? n : fallback)
const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Turns raw model output into rows that are safe to persist: dates come from the trip request (not the model),
 * the number of days is enforced, times/currency/coordinates are normalised, and budget.spent is the sum of costs.
 */
export function cleanGeneratedItinerary(
  generated: GeneratedItinerary,
  dayKeys: string[],
  totalBudget: number,
  fallbackName: string,
): CleanItinerary {
  if (generated.days.length < dayKeys.length) {
    throw new Error(`Model returned ${generated.days.length} days, expected ${dayKeys.length}`)
  }

  const days = dayKeys.map((date, i) => {
    const activities = generated.days[i].activities
      .map((a): CleanActivity => {
        const { start, end } = normalizeTimes(a.start_time, a.end_time)
        const loc = a.location
        const validLoc =
          loc && Math.abs(finite(loc.lat, 999)) <= 90 && Math.abs(finite(loc.lng, 999)) <= 180 && !(loc.lat === 0 && loc.lng === 0)
        return {
          start_time: start,
          end_time: end,
          title: sanitizeText(a.title, 200) || "Untitled activity",
          description: sanitizeText(a.description, 2000),
          type: (ACTIVITY_TYPES as readonly string[]).includes(a.type) ? (a.type as ActivityType) : "other",
          eco_tag: sanitizeText(a.ecoTag, 80) || "Eco-friendly",
          cost: Math.min(round2(Math.max(0, finite(a.cost))), 1_000_000),
          location: validLoc
            ? {
                name: sanitizeText(loc.name, 200),
                lat: Number(loc.lat.toFixed(6)),
                lng: Number(loc.lng.toFixed(6)),
                address: sanitizeText(loc.address, 300),
              }
            : null,
        }
      })
      .sort((x, y) => x.start_time.localeCompare(y.start_time))
    return { date, activities }
  })

  const spent = round2(days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0), 0))
  const saved = Math.max(0, round2(finite(generated.carbon.saved)))
  const total = Math.max(0, round2(finite(generated.carbon.total)))
  const percentage = Math.min(100, Math.max(0, Math.round(finite(generated.carbon.percentage))))

  return {
    name: sanitizeText(generated.name, 120) || sanitizeText(fallbackName, 120),
    destination: sanitizeText(generated.destination, 200),
    days,
    budget: { total: totalBudget, spent, remaining: round2(totalBudget - spent) },
    carbon: { saved, total, percentage },
    icon: (ITINERARY_ICONS as readonly string[]).includes(generated.icon) ? generated.icon : "global",
  }
}

const CANCELLED_OR_DRAFT = new Set(["draft", "cancelled"])

/** Itineraries are created as "confirmed" and never updated, so a finished trip is shown as completed. */
export function effectiveStatus(status: string, dateTo: string, today: string = toDateKey(new Date())): string {
  if (CANCELLED_OR_DRAFT.has(status) || status === "completed") return status
  return dateTo.slice(0, 10) < today ? "completed" : status
}

export function itineraryToText(itn: {
  name: string
  destination_name: string
  date_from: string
  date_to: string
  days: { date: string; activities: { start_time: string; end_time: string | null; title: string; description: string; address: string | null; cost: number }[] }[]
}): string {
  const lines = [itn.name, `${itn.destination_name} | ${formatDateKey(itn.date_from)} - ${formatDateKey(itn.date_to)}`, ""]
  itn.days.forEach((day, i) => {
    lines.push(`Day ${i + 1} - ${formatDateKey(day.date)}`)
    for (const a of day.activities) {
      const time = a.end_time ? `${a.start_time.slice(0, 5)}-${a.end_time.slice(0, 5)}` : a.start_time.slice(0, 5)
      lines.push(`  ${time}  ${a.title}${a.cost ? ` (~$${a.cost})` : ""}`)
      if (a.address) lines.push(`         ${a.address}`)
      if (a.description) lines.push(`         ${a.description}`)
    }
    lines.push("")
  })
  return lines.join("\n")
}
