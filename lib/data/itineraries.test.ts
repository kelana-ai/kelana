import { describe, expect, it } from "vitest"

import { cleanGeneratedItinerary } from "@/lib/itinerary"
import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { generatedItinerary } from "@/test/fixtures"
import {
  activityRows,
  countItinerariesSince,
  getItinerary,
  getItineraryTitle,
  getPlan,
  insertDays,
  listItineraries,
  removeItinerary,
  replacePlan,
  saveItinerary,
  toListItem,
  type ItineraryListRow,
  type ItineraryMeta,
} from "./itineraries"

const dayKeys = ["2026-11-02", "2026-11-03"]
const clean = cleanGeneratedItinerary(generatedItinerary(2), dayKeys, 800, "Ubud trip")

const meta: ItineraryMeta = {
  userId: "user-1",
  description: "Eco-friendly itinerary to Ubud",
  destinationName: "Ubud, Bali",
  destinationLat: -8.5069,
  destinationLng: 115.2625,
  dateFrom: "2026-11-02",
  dateTo: "2026-11-03",
  travelType: "couple",
  travelStyles: ["nature"],
  dietaryNeeds: [],
}

function database(replies: Record<string, Reply> = {}) {
  const all: Record<string, Reply> = {
    "insert itineraries": { data: { id: "itn-1" } },
    "insert itinerary_days": {
      data: [
        { id: "day-1", day_index: 0 },
        { id: "day-2", day_index: 1 },
      ],
    },
    ...replies,
  }
  return fakeSupabase({ reply: (call) => all[`${call.action} ${call.table}`] ?? {} })
}

const failure = { message: "denied" }

const row: ItineraryListRow = {
  id: "itn-1",
  name: "Ubud trip",
  description: "Slow travel",
  status: "confirmed",
  destination_name: "Ubud, Bali",
  date_from: "2026-11-02",
  date_to: "2026-11-09",
  travel_type: "couple",
  budget: { total: 800 },
  carbon_metrics: { saved: 120, percentage: 42 },
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-02T10:00:00Z",
  user_id: "user-1",
}

describe("toListItem", () => {
  it("renames the columns the list uses", () => {
    expect(toListItem(row)).toEqual({
      id: "itn-1",
      name: "Ubud trip",
      description: "Slow travel",
      destination: "Ubud, Bali",
      start_date: "2026-11-02",
      end_date: "2026-11-09",
      status: "confirmed",
      carbon_saved: 120,
      carbon_percentage: 42,
      budget_total: 800,
      travel_type: "couple",
      created_at: "2026-10-01T10:00:00Z",
      updated_at: "2026-10-02T10:00:00Z",
      user_id: "user-1",
    })
  })

  it("reads missing totals as zero and a missing update time as the creation time", () => {
    expect(toListItem({ ...row, budget: null, carbon_metrics: null, updated_at: null })).toMatchObject({
      carbon_saved: 0,
      carbon_percentage: 0,
      budget_total: 0,
      updated_at: "2026-10-01T10:00:00Z",
    })
    expect(toListItem({ ...row, budget: {}, carbon_metrics: {} })).toMatchObject({ carbon_saved: 0, budget_total: 0 })
  })
})

describe("listItineraries", () => {
  it("asks for the newest itineraries first and maps them for the list", async () => {
    const { client, calls } = database({ "select itineraries": { data: [row] } })

    expect(await listItineraries(client)).toEqual([toListItem(row)])
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ table: "itineraries", action: "select", order: { column: "created_at", ascending: false }, filters: [] })
    expect(calls[0].payload).toContain("destination_name")
  })

  it("returns an empty list when the user has none", async () => {
    expect(await listItineraries(database({ "select itineraries": { data: null } }).client)).toEqual([])
  })

  it("throws the database error", async () => {
    await expect(listItineraries(database({ "select itineraries": { error: failure } }).client)).rejects.toBe(failure)
  })
})

describe("getItinerary", () => {
  it("looks one itinerary up by id together with its days and activities", async () => {
    const { client, calls } = database({ "select itineraries": { data: { id: "itn-1" } } })

    expect(await getItinerary(client, "itn-1")).toEqual({ id: "itn-1" })
    expect(calls[0].filters).toEqual([{ op: "eq", column: "id", value: "itn-1" }])
    expect(calls[0].payload).toContain("itinerary_days")
    expect(calls[0].payload).toContain("itinerary_activities")
  })

  it("returns null when no row is visible to the user", async () => {
    expect(await getItinerary(database({ "select itineraries": { data: null } }).client, "other")).toBeNull()
  })

  it("throws the database error", async () => {
    await expect(getItinerary(database({ "select itineraries": { error: failure } }).client, "itn-1")).rejects.toBe(failure)
  })
})

describe("getItineraryTitle", () => {
  it("selects only the id, the name and the destination", async () => {
    const title = { id: "itn-1", name: "Ubud trip", destination_name: "Ubud, Bali" }
    const { client, calls } = database({ "select itineraries": { data: title } })

    expect(await getItineraryTitle(client, "itn-1")).toEqual(title)
    expect(calls[0].payload).toBe("id, name, destination_name")
    expect(calls[0].filters).toEqual([{ op: "eq", column: "id", value: "itn-1" }])
  })

  it("returns null when there is no such itinerary", async () => {
    expect(await getItineraryTitle(database().client, "missing")).toBeNull()
  })

  it("throws the database error", async () => {
    await expect(getItineraryTitle(database({ "select itineraries": { error: failure } }).client, "itn-1")).rejects.toBe(failure)
  })
})

describe("removeItinerary", () => {
  it("deletes by id and reports that a row was removed", async () => {
    const { client, calls } = database({ "delete itineraries": { data: [{ id: "itn-1" }] } })

    expect(await removeItinerary(client, "itn-1")).toBe(true)
    expect(calls[0]).toMatchObject({ table: "itineraries", action: "delete", filters: [{ op: "eq", column: "id", value: "itn-1" }] })
  })

  it.each([[[]], [null]])("reports that nothing was removed when the database returns %j", async (data) => {
    expect(await removeItinerary(database({ "delete itineraries": { data } }).client, "itn-1")).toBe(false)
  })

  it("throws the database error", async () => {
    await expect(removeItinerary(database({ "delete itineraries": { error: failure } }).client, "itn-1")).rejects.toBe(failure)
  })
})

describe("countItinerariesSince", () => {
  it("counts the rows created since the given time without fetching them", async () => {
    const { client, calls } = database({ "select itineraries": { count: 7 } })

    expect(await countItinerariesSince(client, "2026-10-01T00:00:00.000Z")).toBe(7)
    expect(calls[0].options).toEqual({ count: "exact", head: true })
    expect(calls[0].filters).toEqual([{ op: "gte", column: "created_at", value: "2026-10-01T00:00:00.000Z" }])
  })

  it("reads a count that is not available as zero", async () => {
    expect(await countItinerariesSince(database({ "select itineraries": { count: null } }).client, "2026-10-01T00:00:00.000Z")).toBe(0)
    expect(await countItinerariesSince(database({ "select itineraries": { error: failure } }).client, "2026-10-01T00:00:00.000Z")).toBe(0)
  })
})

describe("getPlan", () => {
  it("selects the itinerary with its days and activities by id", async () => {
    const plan = { id: "itn-1", itinerary_days: [] }
    const { client, calls } = database({ "select itineraries": { data: plan } })

    expect(await getPlan(client, "itn-1")).toEqual(plan)
    expect(calls[0].filters).toEqual([{ op: "eq", column: "id", value: "itn-1" }])
    expect(calls[0].payload).toContain("activity_index")
  })

  it("returns null for an itinerary the user cannot see", async () => {
    expect(await getPlan(database().client, "itn-1")).toBeNull()
  })

  it("throws the database error", async () => {
    await expect(getPlan(database({ "select itineraries": { error: failure } }).client, "itn-1")).rejects.toBe(failure)
  })
})

describe("replacePlan", () => {
  const totals = { budget: { total: 800, spent: 40, remaining: 760 }, carbon: { saved: 30, total: 50, percentage: 60 } }
  type Args = { p_itinerary_id: string; p_days: { day_index: number; date: string; activities: Record<string, unknown>[] }[]; p_budget: unknown; p_carbon: unknown }

  it("replaces the days, their activities and the totals in one database call", async () => {
    const { client, calls } = database()

    await replacePlan(client, "itn-1", clean.days, totals)

    expect(steps(calls)).toEqual(["rpc replace_itinerary_plan"])
    const args = calls[0].payload as Args
    expect(args.p_itinerary_id).toBe("itn-1")
    expect(args.p_budget).toEqual(totals.budget)
    expect(args.p_carbon).toEqual(totals.carbon)
    expect(args.p_days.map((day) => [day.day_index, day.date, day.activities.length])).toEqual([
      [0, "2026-11-02", 2],
      [1, "2026-11-03", 2],
    ])
  })

  it("sends the activities as rows without a day id, in the order the model gave them", async () => {
    const { client, calls } = database()

    await replacePlan(client, "itn-1", clean.days, totals)

    const [first] = (calls[0].payload as Args).p_days[0].activities
    expect(first).toEqual({
      activity_index: 0,
      start_time: "09:00",
      end_time: "10:30",
      title: "Rice terrace walk 1",
      description: "Walk the ridge before the heat.",
      type: "sightseeing",
      status: "planned",
      location_name: "Tegallalang",
      location_lat: -8.4312,
      location_lng: 115.2793,
      address: "Tegallalang, Gianyar",
      cost: 12,
      currency: "USD",
      eco_tags: ["Walkable"],
    })
    expect(first).not.toHaveProperty("day_id")
  })

  it("sends an empty list for a day without activities", async () => {
    const { client, calls } = database()

    await replacePlan(client, "itn-1", [{ date: "2026-11-02", activities: [] }], totals)

    expect((calls[0].payload as Args).p_days).toEqual([{ day_index: 0, date: "2026-11-02", activities: [] }])
  })

  it("throws the database error", async () => {
    const { client } = database({ "rpc replace_itinerary_plan": { error: failure } })
    await expect(replacePlan(client, "itn-1", clean.days, totals)).rejects.toBe(failure)
  })
})

describe("activityRows", () => {
  it("maps an activity with a location to a row", () => {
    const [row] = activityRows("day-1", clean.days[0].activities)

    expect(row).toEqual({
      day_id: "day-1",
      activity_index: 0,
      start_time: "09:00",
      end_time: "10:30",
      title: "Rice terrace walk 1",
      description: "Walk the ridge before the heat.",
      type: "sightseeing",
      status: "planned",
      location_name: "Tegallalang",
      location_lat: -8.4312,
      location_lng: 115.2793,
      address: "Tegallalang, Gianyar",
      cost: 12,
      currency: "USD",
      eco_tags: ["Walkable"],
    })
  })

  it("stores nulls for an activity without a location or end time", () => {
    const [, lunch] = activityRows("day-1", clean.days[0].activities)

    expect(lunch).toMatchObject({
      activity_index: 1,
      end_time: null,
      location_name: null,
      location_lat: null,
      location_lng: null,
      address: null,
    })
  })
})

describe("saveItinerary", () => {
  it("inserts the itinerary, its days and its activities and returns the id", async () => {
    const { client, calls } = database()

    expect(await saveItinerary(client, meta, clean)).toBe("itn-1")
    expect(steps(calls)).toEqual(["insert itineraries", "insert itinerary_days", "insert itinerary_activities"])
  })

  it("rethrows the database error and deletes nothing when the itinerary insert fails", async () => {
    const failure = { message: "denied" }
    const { client, calls } = database({ "insert itineraries": { error: failure } })

    await expect(saveItinerary(client, meta, clean)).rejects.toBe(failure)
    expect(steps(calls)).toEqual(["insert itineraries"])
  })

  it("fails when the database returns no row and no error", async () => {
    const { client } = database({ "insert itineraries": {} })
    await expect(saveItinerary(client, meta, clean)).rejects.toThrow("Failed to insert itinerary")
  })

  it.each(["insert itinerary_days", "insert itinerary_activities"])("deletes the itinerary and rethrows when %s fails", async (failing) => {
    const failure = { message: "write failed" }
    const { client, calls } = database({ [failing]: { error: failure } })

    await expect(saveItinerary(client, meta, clean)).rejects.toBe(failure)
    expect(calls.at(-1)).toMatchObject({
      table: "itineraries",
      action: "delete",
      filters: [{ op: "eq", column: "id", value: "itn-1" }],
    })
  })
})

describe("insertDays", () => {
  it("attaches activities to the day ids by day index, not by the order the rows come back", async () => {
    const { client, calls } = database({
      "insert itinerary_days": {
        data: [
          { id: "second", day_index: 1 },
          { id: "first", day_index: 0 },
        ],
      },
    })

    await insertDays(client, "itn-1", clean.days)

    const rows = calls[1].payload as { day_id: string; title: string }[]
    expect(rows.map((r) => [r.day_id, r.title])).toEqual([
      ["second", "Rice terrace walk 2"],
      ["second", "Lunch at a warung 2"],
      ["first", "Rice terrace walk 1"],
      ["first", "Lunch at a warung 1"],
    ])
  })

  it("skips the activities insert when the days have no activities", async () => {
    const { client, calls } = database()

    await insertDays(client, "itn-1", [
      { date: "2026-11-02", activities: [] },
      { date: "2026-11-03", activities: [] },
    ])

    expect(steps(calls)).toEqual(["insert itinerary_days"])
  })

  it("fails when the database returns no day rows and no error", async () => {
    const { client } = database({ "insert itinerary_days": {} })
    await expect(insertDays(client, "itn-1", clean.days)).rejects.toThrow("Failed to insert days")
  })
})
