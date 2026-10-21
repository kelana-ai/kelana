import { describe, expect, it } from "vitest"

import { DEFAULT_FILTERS, filterItineraries, isFiltering, isNarrowed, type Itinerary, type ListFilters } from "./itinerary-filters"

const item = (overrides: Partial<Itinerary> = {}): Itinerary => ({
  id: "t1",
  name: "Ubud slow trip",
  description: "Rice terraces and yoga",
  destination: "Ubud, Bali",
  start_date: "2026-11-02",
  end_date: "2026-11-04",
  status: "confirmed",
  carbon_saved: 50,
  carbon_percentage: 40,
  budget_total: 800,
  travel_type: "couple",
  created_at: "2026-10-20T10:00:00Z",
  updated_at: "2026-10-20T10:00:00Z",
  user_id: "user-1",
  ...overrides,
})

const filters = (overrides: Partial<ListFilters> = {}): ListFilters => ({ ...DEFAULT_FILTERS, ...overrides })
const ids = (list: Itinerary[]) => list.map((i) => i.id)

const mixed = [
  item({ id: "draft", status: "draft" }),
  item({ id: "planning", status: "planning" }),
  item({ id: "confirmed", status: "confirmed" }),
  item({ id: "completed", status: "completed" }),
  item({ id: "cancelled", status: "cancelled" }),
]

describe("filterItineraries by tab", () => {
  it("shows everything on the all tab", () => {
    expect(ids(filterItineraries(mixed, filters({ sort: "none" })))).toEqual(["draft", "planning", "confirmed", "completed", "cancelled"])
  })

  it.each([
    ["upcoming", ["planning", "confirmed"]],
    ["past", ["completed", "cancelled"]],
    ["drafts", ["draft"]],
  ])("keeps the %s statuses", (tab, expected) => {
    expect(ids(filterItineraries(mixed, filters({ tab, sort: "none" })))).toEqual(expected)
  })

  it("does not filter on a tab it does not know", () => {
    expect(filterItineraries(mixed, filters({ tab: "other" }))).toHaveLength(5)
  })
})

describe("filterItineraries by status", () => {
  it("keeps one status", () => {
    expect(ids(filterItineraries(mixed, filters({ status: "completed" })))).toEqual(["completed"])
  })

  it("combines with the tab", () => {
    expect(filterItineraries(mixed, filters({ tab: "upcoming", status: "completed" }))).toEqual([])
    expect(ids(filterItineraries(mixed, filters({ tab: "upcoming", status: "planning" })))).toEqual(["planning"])
  })
})

describe("filterItineraries by search", () => {
  const list = [
    item({ id: "bali", name: "Ubud slow trip", destination: "Ubud, Bali", description: "Yoga mornings" }),
    item({ id: "kyoto", name: "Kyoto temples", destination: "Kyoto, Japan", description: null }),
  ]

  it("matches the name, the destination and the description, ignoring case", () => {
    expect(ids(filterItineraries(list, filters({ query: "SLOW" })))).toEqual(["bali"])
    expect(ids(filterItineraries(list, filters({ query: "japan" })))).toEqual(["kyoto"])
    expect(ids(filterItineraries(list, filters({ query: "yoga" })))).toEqual(["bali"])
  })

  it("copes with a missing description", () => {
    expect(filterItineraries(list, filters({ query: "nothing like this" }))).toEqual([])
  })
})

describe("filterItineraries sorting", () => {
  const list = [
    item({ id: "a", name: "Bravo", created_at: "2026-10-02T00:00:00Z", start_date: "2026-12-01", carbon_saved: 10, budget_total: 500 }),
    item({ id: "b", name: "Alpha", created_at: "2026-10-03T00:00:00Z", start_date: "2026-11-01", carbon_saved: 30, budget_total: 900 }),
    item({ id: "c", name: "Charlie", created_at: "2026-10-01T00:00:00Z", start_date: "2027-01-01", carbon_saved: 20, budget_total: 100 }),
  ]

  it.each([
    ["newest", ["b", "a", "c"]],
    ["oldest", ["c", "a", "b"]],
    ["name_asc", ["b", "a", "c"]],
    ["name_desc", ["c", "a", "b"]],
    ["date_asc", ["b", "a", "c"]],
    ["date_desc", ["c", "a", "b"]],
    ["carbon_saved", ["b", "c", "a"]],
    ["budget_high", ["b", "a", "c"]],
    ["budget_low", ["c", "a", "b"]],
  ])("orders by %s", (sort, expected) => {
    expect(ids(filterItineraries(list, filters({ sort })))).toEqual(expected)
  })

  it("keeps the given order for an unknown sort", () => {
    expect(ids(filterItineraries(list, filters({ sort: "nonsense" })))).toEqual(["a", "b", "c"])
  })

  it("does not change the list it was given", () => {
    const before = ids(list)
    filterItineraries(list, filters({ sort: "name_asc" }))
    expect(ids(list)).toEqual(before)
  })
})

describe("isFiltering and isNarrowed", () => {
  it("are false for the defaults", () => {
    expect(isFiltering(DEFAULT_FILTERS)).toBe(false)
    expect(isNarrowed(DEFAULT_FILTERS)).toBe(false)
  })

  it("count a changed sort as filtering but not as narrowing", () => {
    expect(isFiltering(filters({ sort: "oldest" }))).toBe(true)
    expect(isNarrowed(filters({ sort: "oldest" }))).toBe(false)
  })

  it.each([{ tab: "past" }, { status: "draft" }, { query: "bali" }])("count %o as both", (change) => {
    expect(isFiltering(filters(change))).toBe(true)
    expect(isNarrowed(filters(change))).toBe(true)
  })
})
