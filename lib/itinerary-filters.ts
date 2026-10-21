export type Itinerary = {
  id: string
  name: string
  description: string | null
  destination: string
  start_date: string
  end_date: string
  status: "draft" | "planning" | "confirmed" | "completed" | "cancelled"
  carbon_saved: number
  carbon_percentage: number
  budget_total: number
  travel_type: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface ListFilters {
  tab: string
  status: string
  query: string
  sort: string
}

export const DEFAULT_FILTERS: ListFilters = { tab: "all", status: "all", query: "", sort: "newest" }

const TAB_STATUSES: Record<string, string[]> = {
  upcoming: ["planning", "confirmed"],
  past: ["completed", "cancelled"],
  drafts: ["draft"],
}

const time = (value: string) => new Date(value).getTime()

const COMPARATORS: Record<string, (a: Itinerary, b: Itinerary) => number> = {
  newest: (a, b) => time(b.created_at) - time(a.created_at),
  oldest: (a, b) => time(a.created_at) - time(b.created_at),
  name_asc: (a, b) => a.name.localeCompare(b.name),
  name_desc: (a, b) => b.name.localeCompare(a.name),
  date_asc: (a, b) => time(a.start_date) - time(b.start_date),
  date_desc: (a, b) => time(b.start_date) - time(a.start_date),
  carbon_saved: (a, b) => b.carbon_saved - a.carbon_saved,
  budget_high: (a, b) => b.budget_total - a.budget_total,
  budget_low: (a, b) => a.budget_total - b.budget_total,
}

export function filterItineraries(items: Itinerary[], filters: ListFilters): Itinerary[] {
  let result = [...items]

  const tabStatuses = TAB_STATUSES[filters.tab]
  if (tabStatuses) result = result.filter((item) => tabStatuses.includes(item.status))

  if (filters.status !== "all") result = result.filter((item) => item.status === filters.status)

  if (filters.query) {
    const query = filters.query.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.destination.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)),
    )
  }

  return result.sort(COMPARATORS[filters.sort] ?? (() => 0))
}

export function isFiltering(filters: ListFilters) {
  return Boolean(filters.query || filters.status !== "all" || filters.sort !== "newest" || filters.tab !== "all")
}

export function isNarrowed(filters: ListFilters) {
  return Boolean(filters.query || filters.status !== "all" || filters.tab !== "all")
}
