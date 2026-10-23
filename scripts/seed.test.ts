import { describe, expect, it } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { seedTrips } from "./seed"

const TODAY = new Date(2026, 9, 23)

const dayRows = [
  { id: "day-1", day_index: 0 },
  { id: "day-2", day_index: 1 },
  { id: "day-3", day_index: 2 },
]

function database(existing: string[] = [], replies: Record<string, Reply> = {}) {
  const all: Record<string, Reply> = {
    "select itineraries": { data: existing.map((name) => ({ name })) },
    "insert itineraries": { data: { id: "itn-1" } },
    "insert itinerary_days": { data: dayRows },
    ...replies,
  }
  return fakeSupabase({ reply: (call) => all[`${call.action} ${call.table}`] ?? {} })
}

const inserted = (calls: ReturnType<typeof database>["calls"], table: string) => calls.filter((call) => call.action === "insert" && call.table === table)

describe("seedTrips", () => {
  it("creates the three demo trips for the user in an empty account", async () => {
    const { client, calls } = database()
    const created = await seedTrips(client, "demo-user", TODAY)

    expect(created).toEqual(["Demo: Slow days in Ubud", "Demo: Three days in Kyoto by rail", "Demo: A long weekend in Lisbon"])
    expect(steps(calls)).toEqual([
      "select itineraries",
      ...Array.from({ length: 3 }, () => ["insert itineraries", "insert itinerary_days", "insert itinerary_activities"]).flat(),
    ])
    expect(inserted(calls, "itineraries").map((call) => (call.payload as { user_id: string }).user_id)).toEqual(["demo-user", "demo-user", "demo-user"])
  })

  it("looks only at the trips of the user that have the demo names", async () => {
    const { client, calls } = database()
    await seedTrips(client, "demo-user", TODAY)

    expect(calls[0].filters).toEqual([
      { op: "eq", column: "user_id", value: "demo-user" },
      { op: "in", column: "name", value: ["Demo: Slow days in Ubud", "Demo: Three days in Kyoto by rail", "Demo: A long weekend in Lisbon"] },
    ])
  })

  it("starts each trip in the future and gives every day its date in order", async () => {
    const { client, calls } = database()
    await seedTrips(client, "demo-user", TODAY)

    const [ubud] = inserted(calls, "itineraries").map((call) => call.payload as { date_from: string; date_to: string })
    expect(ubud).toMatchObject({ date_from: "2026-11-06", date_to: "2026-11-08" })
    const days = inserted(calls, "itinerary_days")[0].payload as { day_index: number; date: string }[]
    expect(days.map((day) => [day.day_index, day.date])).toEqual([
      [0, "2026-11-06"],
      [1, "2026-11-07"],
      [2, "2026-11-08"],
    ])
  })

  it("stores the spent budget as the sum of the activity costs", async () => {
    const { client, calls } = database()
    await seedTrips(client, "demo-user", TODAY)

    for (const [index, call] of inserted(calls, "itineraries").entries()) {
      const { budget } = call.payload as { budget: { total: number; spent: number; remaining: number } }
      const costs = (inserted(calls, "itinerary_activities")[index].payload as { cost: number }[]).reduce((sum, row) => sum + row.cost, 0)
      expect(budget.spent).toBe(costs)
      expect(budget.remaining).toBe(budget.total - costs)
    }
  })

  it("gives some activities a place so the map has markers", async () => {
    const { client, calls } = database()
    await seedTrips(client, "demo-user", TODAY)

    const rows = inserted(calls, "itinerary_activities").flatMap((call) => call.payload as { location_lat: number | null; end_time: string | null; start_time: string }[])
    expect(rows.filter((row) => row.location_lat !== null).length).toBeGreaterThan(5)
    expect(rows.every((row) => !row.end_time || row.end_time > row.start_time)).toBe(true)
  })

  it("adds nothing when the demo trips are already there", async () => {
    const all = ["Demo: Slow days in Ubud", "Demo: Three days in Kyoto by rail", "Demo: A long weekend in Lisbon"]
    const { client, calls } = database(all)

    expect(await seedTrips(client, "demo-user", TODAY)).toEqual([])
    expect(steps(calls)).toEqual(["select itineraries"])
  })

  it("adds only the trips that are missing", async () => {
    const { client, calls } = database(["Demo: Slow days in Ubud"])

    expect(await seedTrips(client, "demo-user", TODAY)).toEqual(["Demo: Three days in Kyoto by rail", "Demo: A long weekend in Lisbon"])
    expect(inserted(calls, "itineraries")).toHaveLength(2)
  })

  it("throws the database error from the lookup", async () => {
    const failure = { message: "denied" }
    const { client } = database([], { "select itineraries": { error: failure } })

    await expect(seedTrips(client, "demo-user", TODAY)).rejects.toBe(failure)
  })
})
