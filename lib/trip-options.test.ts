import { describe, expect, it } from "vitest"

import { ACTIVITY_TYPES, ITINERARY_ICONS, MAX_BUDGET, MAX_TRIP_DAYS, MIN_BUDGET } from "./trip-options"

describe("trip limits", () => {
  it("allow a budget from 100 to 10000 and trips of up to 10 days", () => {
    expect(MIN_BUDGET).toBe(100)
    expect(MAX_BUDGET).toBe(10_000)
    expect(MAX_TRIP_DAYS).toBe(10)
  })
})

describe("option lists", () => {
  it.each([
    ["activity types", ACTIVITY_TYPES],
    ["itinerary icons", ITINERARY_ICONS],
  ])("have no duplicate %s", (_label, list) => {
    expect(new Set(list).size).toBe(list.length)
  })

  it("end the activity types with a catch-all that unknown types fall back to", () => {
    expect(ACTIVITY_TYPES.at(-1)).toBe("other")
  })

  it("include the icon that unknown icons fall back to", () => {
    expect(ITINERARY_ICONS).toContain("global")
  })
})
