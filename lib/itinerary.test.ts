import { afterEach, describe, expect, it, vi } from "vitest"

import {
  cleanGeneratedItinerary,
  countTripDays,
  effectiveStatus,
  formatDateKey,
  isDateKey,
  itineraryToText,
  listTripDays,
  normalizeTime,
  normalizeTimes,
  sanitizeText,
  toDateKey,
  type GeneratedActivity,
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

describe("itineraryToText", () => {
  const trip = {
    name: "Ubud trip",
    destination_name: "Ubud, Bali",
    date_from: "2026-10-25",
    date_to: "2026-10-26",
    days: [
      {
        date: "2026-10-25",
        activities: [
          { start_time: "09:00:00", end_time: "10:30:00", title: "Rice terrace walk", description: "Easy loop", address: "Tegallalang", cost: 12 },
          { start_time: "13:00:00", end_time: null, title: "Lunch", description: "", address: null, cost: 0 },
        ],
      },
      { date: "2026-10-26", activities: [] },
    ],
  }

  it("starts with the name, then the destination with its dates", () => {
    const [name, header] = itineraryToText(trip).split("\n")
    expect(name).toBe("Ubud trip")
    expect(header).toBe("Ubud, Bali | Oct 25, 2026 - Oct 26, 2026")
  })

  it("numbers the days and shows the dates that were picked", () => {
    const text = itineraryToText(trip)
    expect(text).toContain("Day 1 - Oct 25, 2026")
    expect(text).toContain("Day 2 - Oct 26, 2026")
  })

  it("trims seconds from times and shows a cost only when there is one", () => {
    const text = itineraryToText(trip)
    expect(text).toContain("  09:00-10:30  Rice terrace walk (~$12)")
    expect(text).toContain("  13:00  Lunch")
    expect(text).not.toContain("Lunch (~$")
  })

  it("adds the address and description under an activity only when they exist", () => {
    const lines = itineraryToText(trip).split("\n")
    const walk = lines.findIndex((l) => l.includes("Rice terrace walk"))
    expect(lines[walk + 1]).toBe("         Tegallalang")
    expect(lines[walk + 2]).toBe("         Easy loop")
    const lunch = lines.findIndex((l) => l.includes("Lunch"))
    expect(lines[lunch + 1]).toBe("")
  })

  it("keeps a day without activities and separates days with a blank line", () => {
    const lines = itineraryToText(trip).split("\n")
    const second = lines.indexOf("Day 2 - Oct 26, 2026")
    expect(lines[second - 1]).toBe("")
    expect(lines[second + 1]).toBe("")
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

describe("isDateKey", () => {
  it.each(["2026-07-01", "2026-01-01", "2026-12-31", "2028-02-29"])("accepts %s", (key) => {
    expect(isDateKey(key)).toBe(true)
  })

  it.each([
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-07-00",
    "2026-07-32",
    "2026-7-1",
    "26-07-01",
    "2026-07-01T00:00:00",
    " 2026-07-01",
    "",
    "tomorrow",
  ])("rejects %j", (key) => {
    expect(isDateKey(key)).toBe(false)
  })
})

describe("trip length edges", () => {
  it.each([
    ["a single day", "2026-11-02", "2026-11-02", 1],
    ["ten days", "2026-11-02", "2026-11-11", 10],
    ["eleven days", "2026-11-02", "2026-11-12", 11],
    ["across a month end", "2026-01-30", "2026-02-02", 4],
    ["across a year end", "2026-12-31", "2027-01-01", 2],
    ["over a leap day", "2028-02-28", "2028-03-01", 3],
    ["over a day that is not a leap day", "2026-02-28", "2026-03-01", 2],
    ["over a daylight saving change", "2026-03-28", "2026-03-30", 3],
  ])("counts %s", (_label, from, to, days) => {
    expect(countTripDays(from, to)).toBe(days)
    expect(listTripDays(from, to)).toHaveLength(days)
  })

  it.each([
    ["an end one day before the start", "2026-07-02", "2026-07-01"],
    ["a start that is not on the calendar", "2026-02-30", "2026-03-02"],
    ["an end that is not on the calendar", "2026-03-01", "2026-04-31"],
    ["a start that is empty", "", "2026-07-01"],
    ["a date with a time", "2026-07-01T10:00", "2026-07-02"],
  ])("counts no days for %s", (_label, from, to) => {
    expect(countTripDays(from, to)).toBe(0)
    expect(listTripDays(from, to)).toEqual([])
  })

  it("lists the first and the last day of the range", () => {
    const days = listTripDays("2026-01-30", "2026-02-02")
    expect(days).toEqual(["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"])
  })
})

describe("date keys at the edge of a day", () => {
  it.each([
    ["the first second", new Date(2026, 6, 1, 0, 0, 0)],
    ["noon", new Date(2026, 6, 1, 12, 0, 0)],
    ["the last second", new Date(2026, 6, 1, 23, 59, 59)],
  ])("keeps the calendar day at %s", (_label, date) => {
    expect(toDateKey(date)).toBe("2026-07-01")
  })

  it("pads the month and the day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("formats a key that carries a time and passes anything else through", () => {
    expect(formatDateKey("2026-07-01T23:30:00+00:00")).toBe("Jul 1, 2026")
    expect(formatDateKey("2026-07-01", "MMM d")).toBe("Jul 1")
    expect(formatDateKey("soon")).toBe("soon")
    expect(formatDateKey("2026-02-30")).toBe("2026-02-30")
  })
})

describe("time edges", () => {
  it.each([
    ["00:00", "00:00"],
    ["0:00", "00:00"],
    ["23:59", "23:59"],
    ["9", "09:00"],
    ["0", "00:00"],
    ["12 AM", "00:00"],
    ["12 PM", "12:00"],
    ["12:30 am", "00:30"],
    ["12:30 PM", "12:30"],
    ["1 pm", "13:00"],
    ["11:59 PM", "23:59"],
    ["  7:30  am ", "07:30"],
    ["9:00:59", "09:00"],
  ])("reads %j as %s", (raw, time) => {
    expect(normalizeTime(raw)).toBe(time)
  })

  it.each(["24:00", "24", "23:60", "10:75", "9:5", "9:005", "9.30", "-1:00", "noon", "", "  "])("rejects %j", (raw) => {
    expect(normalizeTime(raw)).toBeNull()
  })

  it("treats a missing time as no time", () => {
    expect(normalizeTime(null)).toBeNull()
    expect(normalizeTime(undefined)).toBeNull()
  })

  it.each([
    ["an end one minute after the start", "09:00", "09:01", "09:01"],
    ["an end in the last minute of the day", "23:58", "23:59", "23:59"],
    ["an end right after midnight", "00:00", "00:01", "00:01"],
    ["pm times written with a meridiem", "9 PM", "11 PM", "23:00"],
  ])("keeps %s", (_label, start, end, kept) => {
    expect(normalizeTimes(start, end).end).toBe(kept)
  })

  it.each([
    ["an end equal to the start", "09:00", "09:00"],
    ["an end one minute before the start", "09:00", "08:59"],
    ["the last minute of the day as both times", "23:59", "23:59"],
    ["midnight as both times", "00:00", "00:00"],
    ["an end after midnight", "11 PM", "1 AM"],
    ["an end that cannot be read", "09:00", "later"],
  ])("drops %s", (_label, start, end) => {
    expect(normalizeTimes(start, end).end).toBeNull()
  })

  it("starts an activity at 09:00 when its start cannot be read", () => {
    expect(normalizeTimes("", undefined)).toEqual({ start: "09:00", end: null })
    expect(normalizeTimes("24:00", "23:00")).toEqual({ start: "09:00", end: "23:00" })
  })
})

describe("sanitizeText", () => {
  it("keeps text up to the limit and cuts what is over it", () => {
    expect(sanitizeText("abcde", 5)).toBe("abcde")
    expect(sanitizeText("abcdef", 5)).toBe("abcde")
    expect(sanitizeText("abc", 0)).toBe("")
  })

  it("trims before it cuts", () => {
    expect(sanitizeText("  abc  ", 2)).toBe("ab")
  })

  it("replaces control characters but keeps tabs and line breaks", () => {
    expect(sanitizeText("a\u0000b\u007fc", 10)).toBe("a b c")
    expect(sanitizeText("\u0007hi\u001f", 10)).toBe("hi")
    expect(sanitizeText("a\tb\nc\r", 10)).toBe("a\tb\nc")
  })

  it("turns a missing value into an empty string", () => {
    expect(sanitizeText(null, 10)).toBe("")
    expect(sanitizeText(undefined, 10)).toBe("")
  })
})

describe("cleanGeneratedItinerary edges", () => {
  const activity = (patch: Partial<GeneratedActivity> = {}): GeneratedActivity => ({
    start_time: "09:00",
    end_time: null,
    title: "Walk",
    description: "",
    type: "sightseeing",
    ecoTag: "Walkable",
    cost: 0,
    currency: "USD",
    location: null,
    ...patch,
  })
  const place = (lat: number, lng: number) => ({ name: "Spot", lat, lng, address: "Road" })
  const itinerary = (activities: GeneratedActivity[], patch: Partial<GeneratedItinerary> = {}): GeneratedItinerary => ({
    name: "Trip",
    destination: "Ubud",
    carbon: { saved: 10, total: 20, percentage: 50 },
    icon: "bali",
    days: [{ activities }],
    ...patch,
  })
  const clean = (generated: GeneratedItinerary, total = 1000) => cleanGeneratedItinerary(generated, ["2026-07-01"], total, "fallback")
  const onlyActivity = (generated: GeneratedItinerary) => clean(generated).days[0].activities[0]

  it.each([
    ["the north pole and the antimeridian", 90, 180],
    ["the south pole and the antimeridian", -90, -180],
    ["a point on the equator", 0, 1],
    ["a point on the prime meridian", 1, 0],
  ])("keeps a location at %s", (_label, lat, lng) => {
    expect(onlyActivity(itinerary([activity({ location: place(lat, lng) })])).location).toMatchObject({ lat, lng })
  })

  it.each([
    ["a latitude just over 90", 90.000001, 0],
    ["a latitude just under -90", -90.000001, 0],
    ["a longitude just over 180", 0, 180.000001],
    ["a longitude just under -180", 0, -180.000001],
    ["null island", 0, 0],
    ["a latitude that is not a number", Number.NaN, 10],
    ["a longitude that is infinite", 10, Number.POSITIVE_INFINITY],
  ])("drops a location at %s", (_label, lat, lng) => {
    expect(onlyActivity(itinerary([activity({ location: place(lat, lng) })])).location).toBeNull()
  })

  it("rounds coordinates to six decimals", () => {
    const location = onlyActivity(itinerary([activity({ location: place(1.23456789, -2.98765432) })])).location
    expect(location).toMatchObject({ lat: 1.234568, lng: -2.987654 })
  })

  it.each([
    [0, 0],
    [0.5, 0.5],
    [12.3456, 12.35],
    [1_000_000, 1_000_000],
    [1_000_000.004, 1_000_000],
    [1_000_001, 1_000_000],
    [-0.01, 0],
    [-1, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])("reads a cost of %s as %s", (cost, expected) => {
    expect(onlyActivity(itinerary([activity({ cost })])).cost).toBe(expected)
  })

  it("treats a cost that is not a number as free", () => {
    expect(onlyActivity(itinerary([activity({ cost: "12" as unknown as number })])).cost).toBe(0)
  })

  it.each([
    [-1, 0],
    [0, 0],
    [49.4, 49],
    [49.5, 50],
    [100, 100],
    [101, 100],
    [Number.NaN, 0],
  ])("reads a carbon share of %s as %s", (percentage, expected) => {
    expect(clean(itinerary([activity()], { carbon: { saved: 1, total: 2, percentage } })).carbon.percentage).toBe(expected)
  })

  it("never reports negative carbon figures", () => {
    expect(clean(itinerary([activity()], { carbon: { saved: -5, total: -1, percentage: 10 } })).carbon).toEqual({ saved: 0, total: 0, percentage: 10 })
  })

  it.each([
    ["title", (n: number) => activity({ title: "t".repeat(n) }), (a: { title: string }) => a.title, 200],
    ["description", (n: number) => activity({ description: "d".repeat(n) }), (a: { description: string }) => a.description, 2000],
    ["eco tag", (n: number) => activity({ ecoTag: "e".repeat(n) }), (a: { eco_tag: string }) => a.eco_tag, 80],
    ["place name", (n: number) => activity({ location: { ...place(1, 1), name: "n".repeat(n) } }), (a: { location: { name: string } | null }) => a.location?.name ?? "", 200],
    ["place address", (n: number) => activity({ location: { ...place(1, 1), address: "a".repeat(n) } }), (a: { location: { address: string } | null }) => a.location?.address ?? "", 300],
  ])("cuts a %s at %i characters", (_label, make, read, max) => {
    expect(read(onlyActivity(itinerary([make(max)]))).length).toBe(max)
    expect(read(onlyActivity(itinerary([make(max + 1)]))).length).toBe(max)
  })

  it("names an activity without a usable title", () => {
    expect(onlyActivity(itinerary([activity({ title: "   " })])).title).toBe("Untitled activity")
  })

  it("keeps the model's order for activities that start together", () => {
    const out = clean(itinerary([activity({ title: "First" }), activity({ title: "Second" }), activity({ title: "Early", start_time: "07:00" })]))
    expect(out.days[0].activities.map((a) => a.title)).toEqual(["Early", "First", "Second"])
  })

  it("keeps the requested number of days and ignores any extra ones", () => {
    const generated = itinerary([activity({ title: "Day one" })])
    generated.days.push({ activities: [activity({ title: "Day two" })] })
    const out = clean(generated)
    expect(out.days).toHaveLength(1)
    expect(out.days[0].activities[0].title).toBe("Day one")
  })

  it("accepts a model answer with exactly as many days as were asked for", () => {
    const generated = itinerary([activity()])
    generated.days.push({ activities: [activity()] })
    expect(cleanGeneratedItinerary(generated, ["2026-07-01", "2026-07-02"], 100, "x").days.map((d) => d.date)).toEqual(["2026-07-01", "2026-07-02"])
  })

  it("handles an empty request", () => {
    const out = cleanGeneratedItinerary(itinerary([]), [], 500, "x")
    expect(out.days).toEqual([])
    expect(out.budget).toEqual({ total: 500, spent: 0, remaining: 500 })
  })

  it.each([
    ["the lowest budget", 100, 40, 60],
    ["the highest budget", 10_000, 40, 9_960],
    ["a trip that costs more than the budget", 10, 40, -30],
  ])("works out the budget for %s", (_label, total, cost, remaining) => {
    const out = clean(itinerary([activity({ cost })]), total)
    expect(out.budget).toEqual({ total, spent: cost, remaining })
  })

  it("falls back to the requested name when the model names none", () => {
    expect(clean(itinerary([activity()], { name: "   " })).name).toBe("fallback")
    expect(cleanGeneratedItinerary(itinerary([activity()], { name: "" }), ["2026-07-01"], 100, "  ").name).toBe("")
  })

  it("cuts the name at 120 characters", () => {
    expect(clean(itinerary([activity()], { name: "n".repeat(120) })).name).toHaveLength(120)
    expect(clean(itinerary([activity()], { name: "n".repeat(121) })).name).toHaveLength(120)
  })
})

describe("effectiveStatus edges", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ["the day before today", "2026-06-30", "completed"],
    ["today", "2026-07-01", "confirmed"],
    ["tomorrow", "2026-07-02", "confirmed"],
    ["the day before today with a time", "2026-06-30T23:59:59Z", "completed"],
    ["today with a time", "2026-07-01T00:00:00Z", "confirmed"],
  ])("gives a confirmed trip that ends %s the status %s", (_label, dateTo, status) => {
    expect(effectiveStatus("confirmed", dateTo, "2026-07-01")).toBe(status)
  })

  it.each(["draft", "cancelled", "completed"])("leaves a %s trip alone however long ago it ended", (status) => {
    expect(effectiveStatus(status, "2020-01-01", "2026-07-01")).toBe(status)
  })

  it("completes any other status once the trip is over", () => {
    expect(effectiveStatus("planned", "2026-06-30", "2026-07-01")).toBe("completed")
  })

  it("uses today's date when none is given", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 1, 23, 59, 59))
    expect(effectiveStatus("confirmed", "2026-07-01")).toBe("confirmed")
    expect(effectiveStatus("confirmed", "2026-06-30")).toBe("completed")
  })
})
