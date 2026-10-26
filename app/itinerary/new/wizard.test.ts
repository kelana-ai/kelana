import { describe, expect, it } from "vitest"

import type { Profile } from "@/lib/data/profiles"
import type { FormValues } from "./schema"
import { dateRangeLabel, defaultTripDates, firstInvalidStep, profileDefaults, submission, suggestedTripName } from "./wizard"

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "user-1",
  full_name: null,
  username: null,
  avatar_url: null,
  website: null,
  updated_at: null,
  ...overrides,
})

describe("firstInvalidStep", () => {
  it.each([
    [["tripName"], 0],
    [["destination"], 0],
    [["dateRange"], 0],
    [["homeLocation"], 1],
    [["travelType"], 2],
    [["travelStyles"], 3],
    [["dietaryNeeds"], 4],
    [["budget"], 5],
  ])("maps %j to step %i", (fields, step) => {
    expect(firstInvalidStep(fields)).toBe(step)
  })

  it("goes to the earliest step that has an error", () => {
    expect(firstInvalidStep(["budget", "travelStyles", "homeLocation"])).toBe(1)
  })

  it("treats an unknown field as the first step and no errors as the first step", () => {
    expect(firstInvalidStep(["somethingNew"])).toBe(0)
    expect(firstInvalidStep([])).toBe(0)
  })
})

describe("defaultTripDates", () => {
  it("starts now and ends a week later", () => {
    const now = new Date(2026, 9, 21, 15, 30)
    const { from, to } = defaultTripDates(now)

    expect(from.getTime()).toBe(now.getTime())
    expect(to.getFullYear()).toBe(2026)
    expect(to.getMonth()).toBe(9)
    expect(to.getDate()).toBe(28)
    expect(to.getHours()).toBe(15)
  })

  it("rolls over into the next month and year", () => {
    const { to } = defaultTripDates(new Date(2026, 11, 28, 12))
    expect([to.getFullYear(), to.getMonth(), to.getDate()]).toEqual([2027, 0, 4])
  })

  it("does not change the date it was given", () => {
    const now = new Date(2026, 9, 21, 12)
    defaultTripDates(now)
    expect(now.getDate()).toBe(21)
  })
})

describe("submission", () => {
  const values: FormValues = {
    tripName: "Ubud trip",
    destination: { name: "Ubud, Bali", lat: -8.5, lng: 115.2 },
    homeLocation: { name: "Jakarta", lat: -6.2, lng: 106.8 },
    dateRange: { from: new Date(2026, 10, 2), to: new Date(2026, 10, 4) },
    travelType: "couple",
    travelStyles: ["nature"],
    dietaryNeeds: ["vegan"],
    budget: 800,
  }

  it("sends the dates as calendar days and keeps the other fields", () => {
    expect(submission(values)).toEqual({
      tripName: "Ubud trip",
      destination: { name: "Ubud, Bali", lat: -8.5, lng: 115.2 },
      homeLocation: { name: "Jakarta", lat: -6.2, lng: 106.8 },
      dateFrom: "2026-11-02",
      dateTo: "2026-11-04",
      travelType: "couple",
      travelStyles: ["nature"],
      dietaryNeeds: ["vegan"],
      budget: 800,
    })
  })

  it("adds the security check token only when there is one", () => {
    expect(submission(values, "token-123").captchaToken).toBe("token-123")
    expect(submission(values).captchaToken).toBeUndefined()
  })

  it("leaves out a home location that has no coordinates", () => {
    expect(submission({ ...values, homeLocation: undefined }).homeLocation).toBeUndefined()
    expect(submission({ ...values, homeLocation: { name: "Jakarta" } }).homeLocation).toBeUndefined()
  })
})

describe("profileDefaults", () => {
  it("takes the home location, travel styles and diets from the profile", () => {
    const result = profileDefaults(
      profile({ home_lat: -6.2, home_lng: 106.8, preferences: { travelStyles: ["nature"] }, dietary_needs: ["vegan"] }),
      {},
    )
    expect(result).toEqual({ homeLocation: { name: "", lat: -6.2, lng: 106.8 }, travelStyles: ["nature"], dietaryNeeds: ["vegan"] })
  })

  it("returns nothing for an empty profile", () => {
    expect(profileDefaults(profile({ preferences: { travelStyles: [] }, dietary_needs: [] }), {})).toEqual({})
    expect(profileDefaults(profile({ home_lat: 0, home_lng: 0 }), {})).toEqual({})
  })

  it("does not overwrite a field the user already changed", () => {
    const result = profileDefaults(
      profile({ home_lat: -6.2, home_lng: 106.8, preferences: { travelStyles: ["nature"] }, dietary_needs: ["vegan"] }),
      { travelStyles: [true], homeLocation: { lat: true } },
    )
    expect(result).toEqual({ dietaryNeeds: ["vegan"] })
  })
})

describe("suggestedTripName", () => {
  it("uses the first part of the destination", () => {
    expect(suggestedTripName("Ubud, Bali")).toBe("Ubud eco trip")
    expect(suggestedTripName("Kyoto")).toBe("Kyoto eco trip")
  })
})

describe("dateRangeLabel", () => {
  it("shows both dates of a range", () => {
    expect(dateRangeLabel({ from: new Date(2026, 10, 2), to: new Date(2026, 10, 9) })).toBe("Nov 2, 2026 - Nov 9, 2026")
  })

  it("shows only the first date while the range is not finished", () => {
    expect(dateRangeLabel({ from: new Date(2026, 10, 2) })).toBe("Nov 2, 2026")
  })

  it("has no label without a first date", () => {
    expect(dateRangeLabel(undefined)).toBeNull()
    expect(dateRangeLabel({})).toBeNull()
    expect(dateRangeLabel({ to: new Date(2026, 10, 9) })).toBeNull()
  })
})
