import { describe, expect, it } from "vitest"

import { downloadFileName, mapActivitiesOf, placesOf, prepareDays, type ActivityRow, type DayRow } from "./itinerary-view"

const activity = (overrides: Partial<ActivityRow> = {}): ActivityRow => ({
  id: "a1",
  activity_index: 0,
  start_time: "09:00:00",
  end_time: "10:30:00",
  title: "Rice terrace walk",
  description: "Walk the ridge.",
  type: "sightseeing",
  status: "planned",
  location_name: "Tegallalang",
  location_lat: -8.4312,
  location_lng: 115.2793,
  address: "Tegallalang, Gianyar",
  cost: 12,
  currency: "USD",
  eco_tags: ["Walkable"],
  ...overrides,
})

const day = (overrides: Partial<DayRow> = {}): DayRow => ({
  id: "d1",
  day_index: 0,
  date: "2026-11-02",
  itinerary_activities: [activity()],
  ...overrides,
})

describe("prepareDays", () => {
  it("orders the days and the activities and labels them", () => {
    const days = prepareDays([
      day({ id: "d2", day_index: 1, date: "2026-11-03", itinerary_activities: [] }),
      day({
        itinerary_activities: [activity({ id: "late", activity_index: 1 }), activity({ id: "early", activity_index: 0 })],
      }),
    ])

    expect(days.map((d) => [d.id, d.rawDate, d.date])).toEqual([
      ["day-1", "2026-11-02", "Nov 2, 2026"],
      ["day-2", "2026-11-03", "Nov 3, 2026"],
    ])
    expect(days[0].activities.map((a) => a.id)).toEqual(["early", "late"])
  })

  it("does not change the rows it was given", () => {
    const rows = [day({ day_index: 1 }), day({ day_index: 0 })]
    prepareDays(rows)
    expect(rows.map((r) => r.day_index)).toEqual([1, 0])
  })

  it("returns nothing for an itinerary without days", () => {
    expect(prepareDays([])).toEqual([])
  })
})

describe("mapActivitiesOf", () => {
  it("lists the located activities with their day, time range and first eco tag", () => {
    const days = prepareDays([
      day({
        itinerary_activities: [
          activity({ id: "a", title: "Walk" }),
          activity({ id: "b", title: "Lunch", activity_index: 1, start_time: "13:00:00", end_time: null, eco_tags: [] }),
        ],
      }),
      day({ id: "d2", day_index: 1, itinerary_activities: [activity({ id: "c", title: "Temple" })] }),
    ])

    expect(mapActivitiesOf(days).map((a) => [a.title, a.day, a.time, a.eco_tag])).toEqual([
      ["Walk", "Day 1", "09:00 - 10:30", "Walkable"],
      ["Lunch", "Day 1", "13:00", ""],
      ["Temple", "Day 2", "09:00 - 10:30", "Walkable"],
    ])
  })

  it("skips activities without coordinates and converts numeric strings", () => {
    const days = prepareDays([
      day({
        itinerary_activities: [
          activity({ id: "none", location_lat: null, location_lng: null }),
          activity({ id: "half", location_lat: -8.4, location_lng: null }),
          activity({ id: "text", activity_index: 1, location_lat: "-8.5" as unknown as number, location_lng: "115.25" as unknown as number }),
        ],
      }),
    ])

    const located = mapActivitiesOf(days)
    expect(located).toHaveLength(1)
    expect(located[0]).toMatchObject({ lat: -8.5, lng: 115.25 })
  })
})

describe("placesOf", () => {
  it("lists each named place with an address once", () => {
    const days = prepareDays([
      day({
        itinerary_activities: [
          activity({ id: "a", location_name: "Tegallalang", address: "Gianyar" }),
          activity({ id: "b", activity_index: 1, location_name: "Tegallalang", address: "Gianyar" }),
          activity({ id: "c", activity_index: 2, location_name: "Warung Sari", address: "Monkey Forest Road" }),
        ],
      }),
    ])

    expect(placesOf(days)).toEqual([
      { name: "Tegallalang", address: "Gianyar" },
      { name: "Warung Sari", address: "Monkey Forest Road" },
    ])
  })

  it("leaves out activities that miss the name or the address", () => {
    const days = prepareDays([
      day({
        itinerary_activities: [
          activity({ id: "a", location_name: null }),
          activity({ id: "b", activity_index: 1, address: null }),
          activity({ id: "c", activity_index: 2, address: "" }),
        ],
      }),
    ])
    expect(placesOf(days)).toEqual([])
  })
})

describe("downloadFileName", () => {
  it.each([
    ["Ubud slow trip", "ubud-slow-trip.txt"],
    ["  Bali: 3 days!  ", "bali-3-days.txt"],
    ["Kyoto_temples-2026", "kyoto_temples-2026.txt"],
  ])("turns %j into %s", (name, expected) => {
    expect(downloadFileName(name)).toBe(expected)
  })

  it("falls back to itinerary when nothing usable is left", () => {
    expect(downloadFileName("")).toBe("itinerary.txt")
    expect(downloadFileName("???")).toBe("itinerary.txt")
  })
})
