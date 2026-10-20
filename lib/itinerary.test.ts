import { describe, expect, it } from "vitest"

import {
  cleanGeneratedItinerary,
  countTripDays,
  effectiveStatus,
  formatDateKey,
  listTripDays,
  normalizeTime,
  normalizeTimes,
  toDateKey,
  type GeneratedItinerary,
} from "./itinerary"
import { checkRateLimit, resetRateLimits } from "./rate-limit"

describe("trip dates", () => {
  it("lists every day of the range regardless of timezone", () => {
    expect(listTripDays("2026-07-01", "2026-07-03")).toEqual(["2026-07-01", "2026-07-02", "2026-07-03"])
    expect(listTripDays("2026-12-30", "2027-01-02")).toHaveLength(4)
  })

  it("counts days and rejects reversed or invalid ranges", () => {
    expect(countTripDays("2026-07-01", "2026-07-01")).toBe(1)
    expect(countTripDays("2026-07-03", "2026-07-01")).toBe(0)
    expect(countTripDays("2026-02-30", "2026-03-02")).toBe(0)
  })

  it("keeps the picked calendar day when serialising", () => {
    expect(toDateKey(new Date(2026, 6, 1))).toBe("2026-07-01")
    expect(formatDateKey("2026-07-01")).toBe("Jul 1, 2026")
  })
})

describe("times", () => {
  it("normalises common formats", () => {
    expect(normalizeTime("9:00 AM")).toBe("09:00")
    expect(normalizeTime("9:05 pm")).toBe("21:05")
    expect(normalizeTime("12:00 AM")).toBe("00:00")
    expect(normalizeTime("21:30:00")).toBe("21:30")
    expect(normalizeTime("late")).toBeNull()
  })

  it("drops an end time that is not after the start (overnight trips)", () => {
    expect(normalizeTimes("22:00", "06:00")).toEqual({ start: "22:00", end: null })
    expect(normalizeTimes("09:00", "10:30")).toEqual({ start: "09:00", end: "10:30" })
    expect(normalizeTimes("bad", null)).toEqual({ start: "09:00", end: null })
  })
})

describe("cleanGeneratedItinerary", () => {
  const base = (): GeneratedItinerary => ({
    name: "  Bali  ",
    destination: "Ubud",
    carbon: { saved: 120.456, total: 300, percentage: 140 },
    icon: "not-an-icon",
    days: [
      {
        activities: [
          {
            start_time: "14:00",
            end_time: "13:00",
            title: "Late",
            description: "d",
            type: "weird",
            ecoTag: "",
            cost: 20.5,
            currency: "EUR",
            location: { name: "Null island", lat: 0, lng: 0, address: "x" },
          },
          {
            start_time: "8:00 AM",
            end_time: null,
            title: "Early",
            description: "d",
            type: "food",
            ecoTag: "Local",
            cost: -5,
            currency: "USD",
            location: { name: "Cafe", lat: -8.5, lng: 115.26, address: "Jl. Raya" },
          },
        ],
      },
    ],
  })

  it("uses the requested dates, sorts, clamps and computes the budget itself", () => {
    const out = cleanGeneratedItinerary(base(), ["2026-07-01"], 1000, "fallback")
    expect(out.days[0].date).toBe("2026-07-01")
    expect(out.days[0].activities.map((a) => a.title)).toEqual(["Early", "Late"])
    expect(out.days[0].activities[1]).toMatchObject({ end_time: null, type: "other", eco_tag: "Eco-friendly", location: null })
    expect(out.days[0].activities[0].cost).toBe(0)
    expect(out.budget).toEqual({ total: 1000, spent: 20.5, remaining: 979.5 })
    expect(out.carbon.percentage).toBe(100)
    expect(out.icon).toBe("global")
    expect(out.name).toBe("Bali")
  })

  it("fails when the model returns too few days", () => {
    expect(() => cleanGeneratedItinerary(base(), ["2026-07-01", "2026-07-02"], 1000, "x")).toThrow(/expected 2/)
  })
})

describe("effectiveStatus", () => {
  it("marks finished trips as completed and leaves draft/cancelled alone", () => {
    expect(effectiveStatus("confirmed", "2026-06-01", "2026-07-01")).toBe("completed")
    expect(effectiveStatus("confirmed", "2026-07-01", "2026-07-01")).toBe("confirmed")
    expect(effectiveStatus("cancelled", "2026-06-01", "2026-07-01")).toBe("cancelled")
  })
})

describe("checkRateLimit", () => {
  it("allows up to the limit inside the window and recovers afterwards", () => {
    resetRateLimits()
    expect(checkRateLimit("u", 2, 1000, 0).ok).toBe(true)
    expect(checkRateLimit("u", 2, 1000, 10).ok).toBe(true)
    const blocked = checkRateLimit("u", 2, 1000, 20)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBe(1)
    expect(checkRateLimit("u", 2, 1000, 1500).ok).toBe(true)
  })
})
