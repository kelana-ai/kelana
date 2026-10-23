import { describe, expect, it } from "vitest"

import { fakeSupabase, type Reply } from "@/test/fake-supabase"
import { listActivityCosts, listDashboardItineraries, listDaysBetween, listPlannedActivities } from "./dashboard"

const failure = { message: "denied" }

function database(replies: Record<string, Reply> = {}) {
  return fakeSupabase({ reply: (call) => replies[`${call.action} ${call.table}`] ?? {} })
}

describe("listDashboardItineraries", () => {
  it("lists the itineraries of one user, newest first", async () => {
    const rows = [{ id: "itn-1" }]
    const { client, calls } = database({ "select itineraries": { data: rows } })

    expect(await listDashboardItineraries(client, "user-1")).toEqual(rows)
    expect(calls[0].filters).toEqual([{ op: "eq", column: "user_id", value: "user-1" }])
    expect(calls[0].order).toEqual({ column: "created_at", ascending: false })
  })

  it("returns an empty list when there is no data", async () => {
    expect(await listDashboardItineraries(database().client, "user-1")).toEqual([])
  })

  it("throws the database error", async () => {
    await expect(listDashboardItineraries(database({ "select itineraries": { error: failure } }).client, "user-1")).rejects.toBe(failure)
  })
})

describe("listDaysBetween", () => {
  it("lists the days inside the range in date order", async () => {
    const rows = [{ id: "day-1", itinerary_id: "itn-1", date: "2026-11-02" }]
    const { client, calls } = database({ "select itinerary_days": { data: rows } })

    expect(await listDaysBetween(client, "2026-11-01", "2026-11-30")).toEqual(rows)
    expect(calls[0].filters).toEqual([
      { op: "gte", column: "date", value: "2026-11-01" },
      { op: "lte", column: "date", value: "2026-11-30" },
    ])
    expect(calls[0].order).toEqual({ column: "date", ascending: true })
  })

  it("returns an empty list when there is no data", async () => {
    expect(await listDaysBetween(database().client, "2026-11-01", "2026-11-30")).toEqual([])
  })

  it("throws the database error", async () => {
    await expect(listDaysBetween(database({ "select itinerary_days": { error: failure } }).client, "a", "b")).rejects.toBe(failure)
  })
})

describe("listPlannedActivities", () => {
  it("lists the planned activities of the given days in time order", async () => {
    const rows = [{ id: "act-1" }]
    const { client, calls } = database({ "select itinerary_activities": { data: rows } })

    expect(await listPlannedActivities(client, ["day-1", "day-2"])).toEqual(rows)
    expect(calls[0].filters).toEqual([
      { op: "in", column: "day_id", value: ["day-1", "day-2"] },
      { op: "eq", column: "status", value: "planned" },
    ])
    expect(calls[0].order).toEqual({ column: "start_time", ascending: true })
  })

  it("returns an empty list when there is no data", async () => {
    expect(await listPlannedActivities(database().client, ["day-1"])).toEqual([])
  })

  it("throws the database error", async () => {
    await expect(listPlannedActivities(database({ "select itinerary_activities": { error: failure } }).client, ["day-1"])).rejects.toBe(failure)
  })
})

describe("listActivityCosts", () => {
  it("reads the type and cost of at most 5000 activities", async () => {
    const rows = [{ type: "food", cost: 12 }]
    const { client, calls } = database({ "select itinerary_activities": { data: rows } })

    expect(await listActivityCosts(client)).toEqual(rows)
    expect(calls[0].payload).toBe("type, cost")
    expect(calls[0].limit).toBe(5000)
  })

  it("returns an empty list when there is no data", async () => {
    expect(await listActivityCosts(database().client)).toEqual([])
  })

  it("throws the database error", async () => {
    await expect(listActivityCosts(database({ "select itinerary_activities": { error: failure } }).client)).rejects.toBe(failure)
  })
})
