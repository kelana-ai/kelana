import { describe, expect, it } from "vitest"

import {
  budgetAllocation,
  carbonByMonth,
  dashboardStats,
  destinationImpact,
  ecoSummary,
  recentItineraries,
  upcomingActivities,
  upcomingWindow,
  type DashboardItinerary,
} from "./dashboard"

const trip = (overrides: Partial<DashboardItinerary> = {}): DashboardItinerary => ({
  id: "trip-1",
  name: "Ubud",
  destination_name: "Ubud, Bali",
  status: "confirmed",
  date_from: "2026-11-02",
  date_to: "2026-11-04",
  budget: { total: 1000, spent: 400 },
  carbon_metrics: { saved: 50 },
  icon: "bali",
  created_at: "2026-10-20T10:00:00Z",
  updated_at: "2026-10-20T10:00:00Z",
  ...overrides,
})

describe("upcomingWindow", () => {
  it("covers today and the next seven days", () => {
    expect(upcomingWindow(new Date(2026, 9, 21, 12))).toEqual({ from: "2026-10-21", to: "2026-10-28" })
  })

  it("rolls over the end of a month and a year", () => {
    expect(upcomingWindow(new Date(2026, 9, 28, 12)).to).toBe("2026-11-04")
    expect(upcomingWindow(new Date(2026, 11, 29, 12))).toEqual({ from: "2026-12-29", to: "2027-01-05" })
  })
})

describe("dashboardStats", () => {
  it("is all zeros for a user without trips", () => {
    expect(dashboardStats([])).toEqual({
      activeTrips: 0,
      totalTrips: 0,
      carbonSaved: 0,
      carbonProgress: 0,
      budgetLeft: 0,
      budgetProgress: 0,
    })
  })

  it("counts only confirmed and planning trips as active", () => {
    const list = ["confirmed", "planning", "completed", "draft", "cancelled"].map((status, i) => trip({ id: `t${i}`, status }))
    expect(dashboardStats(list)).toMatchObject({ activeTrips: 2, totalTrips: 5 })
  })

  it("adds up the budget left of active trips only, against the budget of every trip", () => {
    const list = [
      trip({ id: "a", status: "confirmed", budget: { total: 1000, spent: 400 } }),
      trip({ id: "b", status: "completed", budget: { total: 1000, spent: 100 } }),
    ]
    expect(dashboardStats(list)).toMatchObject({ budgetLeft: 600, budgetProgress: 30 })
  })

  it("treats a missing budget or carbon figure as zero", () => {
    expect(dashboardStats([trip({ budget: null, carbon_metrics: null })])).toMatchObject({
      carbonSaved: 0,
      budgetLeft: 0,
      budgetProgress: 0,
    })
  })

  it("caps both progress values at 100", () => {
    const list = [trip({ carbon_metrics: { saved: 5000 }, budget: { total: 100, spent: -400 } })]
    expect(dashboardStats(list)).toMatchObject({ carbonSaved: 5000, carbonProgress: 100, budgetProgress: 100 })
  })
})

describe("recentItineraries", () => {
  const now = new Date("2026-10-21T10:00:00Z")

  it("keeps the first four and maps the fields for display", () => {
    const list = Array.from({ length: 6 }, (_, i) => trip({ id: `t${i}`, name: `Trip ${i}` }))
    const recent = recentItineraries(list, now)

    expect(recent.map((r) => r.id)).toEqual(["t0", "t1", "t2", "t3"])
    expect(recent[0]).toEqual({
      id: "t0",
      name: "Trip 0",
      destination: "Ubud, Bali",
      dates: "Nov 2, 2026 - Nov 4, 2026",
      status: "confirmed",
      lastUpdated: "1 day ago",
      icon: "/places/bali.png",
    })
  })

  it("falls back to the creation time when there is no update time", () => {
    const [recent] = recentItineraries([trip({ updated_at: null, created_at: "2026-10-21T07:00:00Z" })], now)
    expect(recent.lastUpdated).toBe("about 3 hours ago")
  })
})

describe("carbonByMonth", () => {
  const now = new Date(2026, 9, 21, 12)

  it("returns the last six months, oldest first", () => {
    expect(carbonByMonth([], now).map((m) => m.name)).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct"])
  })

  it("adds the savings of trips to the month they were created in", () => {
    const list = [
      trip({ id: "a", created_at: "2026-10-15T12:00:00Z", carbon_metrics: { saved: 30 } }),
      trip({ id: "b", created_at: "2026-10-02T12:00:00Z", carbon_metrics: { saved: 20 } }),
      trip({ id: "c", created_at: "2026-08-15T12:00:00Z", carbon_metrics: { saved: 7 } }),
      trip({ id: "d", created_at: "2025-10-15T12:00:00Z", carbon_metrics: { saved: 900 } }),
    ]
    expect(carbonByMonth(list, now).map((m) => m.carbon)).toEqual([0, 0, 0, 7, 0, 50])
  })

  it("reaches back across the new year", () => {
    expect(carbonByMonth([], new Date(2027, 1, 10, 12)).map((m) => m.name)).toEqual(["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"])
  })
})

describe("budgetAllocation", () => {
  it("is all zeros without costs", () => {
    expect(budgetAllocation([])).toEqual([
      { name: "Accommodation", value: 0 },
      { name: "Transportation", value: 0 },
      { name: "Food", value: 0 },
      { name: "Activities", value: 0 },
    ])
  })

  it("groups the activity types and returns percentages", () => {
    const rows = [
      { type: "accommodation", cost: 50 },
      { type: "transportation", cost: 25 },
      { type: "food", cost: 15 },
      { type: "drink", cost: 6 },
      { type: "sightseeing", cost: 3 },
      { type: "wellness", cost: 1 },
    ]
    expect(budgetAllocation(rows).map((b) => b.value)).toEqual([50, 25, 21, 4])
  })

  it("reads costs that arrive as strings and ignores missing or invalid ones", () => {
    const rows = [
      { type: "food", cost: "12.50" },
      { type: "food", cost: null },
      { type: "food", cost: "not a number" },
    ]
    expect(budgetAllocation(rows).find((b) => b.name === "Food")?.value).toBe(100)
  })

  it("rounds each share on its own", () => {
    const rows = [
      { type: "accommodation", cost: 1 },
      { type: "transportation", cost: 1 },
      { type: "food", cost: 1 },
    ]
    expect(budgetAllocation(rows).map((b) => b.value)).toEqual([33, 33, 33, 0])
  })
})

describe("ecoSummary", () => {
  it.each([
    [0, 0, 0, "No data", ""],
    [4, 1, 0, "No data", ""],
    [10, 1, 1, "Getting Started", "Try rail or bus options to raise your estimated savings"],
    [390, 1, 39, "Getting Started", "Try rail or bus options to raise your estimated savings"],
    [400, 1, 40, "Good", "You're on the right track to greener travel"],
    [590, 1, 59, "Good", "You're on the right track to greener travel"],
    [600, 1, 60, "Very Good", "Your plans show strong estimated savings"],
    [790, 1, 79, "Very Good", "Your plans show strong estimated savings"],
    [800, 1, 80, "Excellent", "Your plans show large estimated savings"],
    [5000, 1, 100, "Excellent", "Your plans show large estimated savings"],
  ])("rates %i kg over %i trip(s) as score %i, %s", (carbon, trips, score, rating, message) => {
    expect(ecoSummary(carbon, trips)).toEqual({ ecoScore: score, ecoRating: rating, ecoMessage: message })
  })

  it("averages the savings over the number of trips", () => {
    expect(ecoSummary(800, 2).ecoScore).toBe(40)
  })

  it("has no score when there are no trips", () => {
    expect(ecoSummary(800, 0)).toEqual({ ecoScore: 0, ecoRating: "No data", ecoMessage: "" })
  })
})

describe("destinationImpact", () => {
  it("sums the savings per destination, in order of first appearance", () => {
    const list = [
      trip({ id: "a", destination_name: "Ubud", carbon_metrics: { saved: 10 } }),
      trip({ id: "b", destination_name: "Kyoto", carbon_metrics: { saved: 5 } }),
      trip({ id: "c", destination_name: "Ubud", carbon_metrics: { saved: 20 } }),
    ]
    expect(destinationImpact(list)).toEqual([
      { name: "Ubud", impact: 30 },
      { name: "Kyoto", impact: 5 },
    ])
  })

  it("keeps at most four destinations", () => {
    const list = ["A", "B", "C", "D", "E"].map((destination_name, i) => trip({ id: `t${i}`, destination_name }))
    expect(destinationImpact(list).map((d) => d.name)).toEqual(["A", "B", "C", "D"])
  })
})

describe("upcomingActivities", () => {
  const days = [
    { id: "day-1", itinerary_id: "trip-1", date: "2026-10-22" },
    { id: "day-2", itinerary_id: "trip-1", date: "2026-10-23" },
  ]
  const activity = (id: string, day_id: string, start_time: string, title = id) => ({ id, day_id, title, start_time, type: "food" })

  it("orders by date first and by time within a day", () => {
    const result = upcomingActivities(days, [
      activity("late-day-2", "day-2", "08:00:00"),
      activity("evening-day-1", "day-1", "18:00:00"),
      activity("morning-day-1", "day-1", "09:30:00"),
    ])
    expect(result.map((a) => a.id)).toEqual(["morning-day-1", "evening-day-1", "late-day-2"])
  })

  it("breaks ties by title and then by id so the list is stable", () => {
    const result = upcomingActivities(days, [
      activity("b", "day-1", "09:00:00", "Walk"),
      activity("a", "day-1", "09:00:00", "Walk"),
      activity("c", "day-1", "09:00:00", "Breakfast"),
    ])
    expect(result.map((a) => a.id)).toEqual(["c", "a", "b"])
  })

  it("shows the earliest ten", () => {
    const many = Array.from({ length: 14 }, (_, i) => activity(`a${String(i).padStart(2, "0")}`, "day-1", `${String(8 + i).padStart(2, "0")}:00:00`))
    const result = upcomingActivities(days, many)
    expect(result).toHaveLength(10)
    expect(result[9].id).toBe("a09")
  })

  it("formats the date and links the itinerary", () => {
    const [first] = upcomingActivities(days, [activity("a", "day-2", "10:00:00", "Market")])
    expect(first).toEqual({ id: "a", title: "Market", date: "Oct 23, 2026", time: "10:00:00", type: "food", itineraryId: "trip-1" })
  })

  it.each([
    ["first", ["orphan", "known"]],
    ["last", ["known", "orphan"]],
  ])("keeps an activity whose day is unknown after the others when it is given %s", (_position, order) => {
    const given = { orphan: activity("orphan", "day-9", "07:00:00"), known: activity("known", "day-1", "20:00:00") }
    const result = upcomingActivities(
      days,
      order.map((id) => given[id as keyof typeof given]),
    )
    expect(result.map((a) => a.id)).toEqual(["known", "orphan"])
    expect(result[1]).toMatchObject({ date: "", itineraryId: "" })
  })
})
