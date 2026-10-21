import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { loadDashboard } from "./dashboard"

const NOW = new Date(2026, 9, 21, 12)

const itineraries = [
  {
    id: "trip-1",
    name: "Ubud slow trip",
    destination_name: "Ubud, Bali",
    status: "confirmed",
    date_from: "2026-10-22",
    date_to: "2026-10-24",
    budget: { total: 800, spent: 300 },
    carbon_metrics: { saved: 400 },
    icon: "bali",
    created_at: "2026-10-20T10:00:00Z",
    updated_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "trip-2",
    name: "Old Kyoto trip",
    destination_name: "Kyoto, Japan",
    status: "confirmed",
    date_from: "2026-09-01",
    date_to: "2026-09-03",
    budget: { total: 500, spent: 100 },
    carbon_metrics: { saved: 200 },
    icon: "tokyo",
    created_at: "2026-08-15T10:00:00Z",
    updated_at: null,
  },
]

const days = [
  { id: "day-2", itinerary_id: "trip-1", date: "2026-10-23" },
  { id: "day-1", itinerary_id: "trip-1", date: "2026-10-22" },
]

const activities = [
  { id: "a-late", day_id: "day-2", title: "Market", start_time: "08:00:00", type: "food", status: "planned" },
  { id: "a-early", day_id: "day-1", title: "Walk", start_time: "09:30:00", type: "sightseeing", status: "planned" },
]

const costs = [
  { type: "accommodation", cost: 60 },
  { type: "food", cost: 40 },
]

const defaults: Record<string, Reply> = {
  "select itineraries": { data: itineraries },
  "select itinerary_days": { data: days },
  "select itinerary_activities": { data: costs },
}

function setup(options: { user?: { id: string } | null; replies?: Record<string, Reply> } = {}) {
  const { client, calls } = fakeSupabase({
    user: options.user,
    reply: (call) => {
      if (call.table === "itinerary_activities" && call.filters.some((f) => f.op === "in")) return { data: activities }
      return { ...defaults, ...options.replies }[`${call.action} ${call.table}`] ?? {}
    },
  })
  return { getSupabase: async () => client, calls }
}

describe("loadDashboard", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns an error and runs no query when the user is not signed in", async () => {
    const { getSupabase, calls } = setup({ user: null })
    const result = await loadDashboard(getSupabase, NOW)

    expect(result.data).toBeNull()
    expect(result.error?.message).toBe("Not authenticated")
    expect(calls).toEqual([])
  })

  it("loads the itineraries of the signed-in user, newest first", async () => {
    const { getSupabase, calls } = setup({ user: { id: "user-9" } })
    await loadDashboard(getSupabase, NOW)

    expect(calls[0]).toMatchObject({
      table: "itineraries",
      action: "select",
      filters: [{ op: "eq", column: "user_id", value: "user-9" }],
      order: { column: "created_at", ascending: false },
    })
  })

  it("looks for days from today to a week ahead and for the planned activities on them", async () => {
    const { getSupabase, calls } = setup()
    await loadDashboard(getSupabase, NOW)

    expect(calls[1].filters).toEqual([
      { op: "gte", column: "date", value: "2026-10-21" },
      { op: "lte", column: "date", value: "2026-10-28" },
    ])
    expect(calls[2].filters).toEqual([
      { op: "in", column: "day_id", value: ["day-2", "day-1"] },
      { op: "eq", column: "status", value: "planned" },
    ])
  })

  it("skips the activities query when no day is coming up", async () => {
    const { getSupabase, calls } = setup({ replies: { "select itinerary_days": { data: [] } } })
    const result = await loadDashboard(getSupabase, NOW)

    expect(steps(calls)).toEqual(["select itineraries", "select itinerary_days", "select itinerary_activities"])
    expect(calls[2].limit).toBe(5000)
    expect(result.data?.upcomingActivities).toEqual([])
  })

  it("combines the figures for the dashboard", async () => {
    const { getSupabase } = setup()
    const { data, error } = await loadDashboard(getSupabase, NOW)

    expect(error).toBeNull()
    expect(data?.stats).toEqual({
      activeTrips: 1,
      totalTrips: 2,
      carbonSaved: 600,
      carbonProgress: 60,
      budgetLeft: 500,
      budgetProgress: (500 / 1300) * 100,
    })
    expect(data?.recentItineraries.map((r) => [r.name, r.status])).toEqual([
      ["Ubud slow trip", "confirmed"],
      ["Old Kyoto trip", "completed"],
    ])
    expect(data?.analytics).toMatchObject({
      ecoScore: 30,
      ecoRating: "Getting Started",
      budgetData: [
        { name: "Accommodation", value: 60 },
        { name: "Transportation", value: 0 },
        { name: "Food", value: 40 },
        { name: "Activities", value: 0 },
      ],
      destinationData: [
        { name: "Ubud, Bali", impact: 400 },
        { name: "Kyoto, Japan", impact: 200 },
      ],
    })
    expect(data?.analytics.carbonData.map((m) => m.carbon)).toEqual([0, 0, 0, 200, 0, 400])
  })

  it("lists the upcoming activities by date and then by time", async () => {
    const { getSupabase } = setup()
    const { data } = await loadDashboard(getSupabase, NOW)

    expect(data?.upcomingActivities.map((a) => [a.id, a.date, a.itineraryId])).toEqual([
      ["a-early", "Oct 22, 2026", "trip-1"],
      ["a-late", "Oct 23, 2026", "trip-1"],
    ])
  })

  it("derives completed from the end date, as the itinerary list does", async () => {
    const { getSupabase } = setup()
    const { data } = await loadDashboard(getSupabase, NOW)

    expect(data?.stats.activeTrips).toBe(1)
    expect(data?.recentItineraries[1].status).toBe("completed")
  })

  it.each(["select itineraries", "select itinerary_days", "select itinerary_activities"])("returns the error when %s fails", async (failing) => {
    const failure = { message: "query failed" }
    const { getSupabase } = setup({ replies: { [failing]: { error: failure } } })
    const result = await loadDashboard(getSupabase, NOW)

    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
    expect(console.error).toHaveBeenCalledWith("Error fetching dashboard data:", failure)
  })

  it("returns an error when the client cannot be created", async () => {
    const result = await loadDashboard(async () => {
      throw new Error("cookies are not available")
    }, NOW)

    expect(result.data).toBeNull()
    expect(result.error?.message).toBe("cookies are not available")
  })
})
