import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { GeneratedItinerary } from "@/lib/itinerary"
import type { ModelRun } from "../trace"
import { resetRateLimits } from "@/lib/rate-limit"
import { MAX_BUDGET, MIN_BUDGET } from "@/lib/trip-options"
import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { generatedItinerary, modelRun, usage } from "@/test/fixtures"
import { reportError } from "@/lib/report"
import { submit } from "./submit"

const NOW = new Date("2026-10-20T10:00:00Z")
vi.mock("@/lib/report", () => ({ reportError: vi.fn() }))

const GENERIC_ERROR = "We couldn't generate your itinerary. Please try again."

const trip = {
  tripName: "Ubud trip",
  destination: { name: "Ubud, Bali, Indonesia", lat: -8.5069, lng: 115.2625 },
  dateFrom: "2026-11-02",
  dateTo: "2026-11-03",
  travelType: "couple",
  travelStyles: ["nature", "culinary"],
  dietaryNeeds: ["vegetarian"],
  budget: 800,
}

const dayRows = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `day-${i + 1}`, day_index: i }))

const defaultReplies: Record<string, Reply> = {
  "select itineraries": { count: 0 },
  "insert itineraries": { data: { id: "itn-1" } },
  "insert itinerary_days": { data: dayRows(2) },
}

function setup(options: { user?: { id: string } | null; replies?: Record<string, Reply>; itinerary?: GeneratedItinerary } = {}) {
  const { client, calls } = fakeSupabase({
    user: options.user,
    reply: (call) => ({ ...defaultReplies, ...options.replies })[`${call.action} ${call.table}`] ?? {},
  })
  const getSupabase = vi.fn(async () => client)
  const generate = vi.fn<(prompt: string) => Promise<ModelRun>>(async () => modelRun(options.itinerary ?? generatedItinerary(2)))
  return { deps: { getSupabase, generate }, getSupabase, generate, calls }
}

function requestIn(prompt: string) {
  return JSON.parse(prompt.slice(prompt.indexOf("Trip request (JSON):\n") + "Trip request (JSON):\n".length))
}

describe("submit", () => {
  beforeEach(() => {
    resetRateLimits()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe("input", () => {
    it.each([null, undefined, "a trip", 42])("rejects %j", async (input) => {
      const { deps, getSupabase } = setup()
      expect((await submit(deps, input)).success).toBe(false)
      expect(getSupabase).not.toHaveBeenCalled()
    })

    it.each<[string, Record<string, unknown>]>([
      ["a trip name that is too short", { tripName: "a" }],
      ["a destination without coordinates", { destination: { name: "Ubud" } }],
      ["a latitude out of range", { destination: { name: "Ubud", lat: 91, lng: 0 } }],
      ["an unknown travel type", { travelType: "pirate" }],
      ["no travel style", { travelStyles: [] }],
      ["an unknown dietary need", { dietaryNeeds: ["carnivore"] }],
      ["a budget below the minimum", { budget: MIN_BUDGET - 1 }],
      ["a budget above the maximum", { budget: MAX_BUDGET + 1 }],
      ["a date that is not on the calendar", { dateFrom: "2026-02-30" }],
    ])("rejects %s before touching the database", async (_label, patch) => {
      const { deps, getSupabase, generate } = setup()
      expect((await submit(deps, { ...trip, ...patch })).success).toBe(false)
      expect(getSupabase).not.toHaveBeenCalled()
      expect(generate).not.toHaveBeenCalled()
    })

    it("rejects a trip that ends before it starts", async () => {
      const { deps } = setup()
      expect(await submit(deps, { ...trip, dateFrom: "2026-11-05", dateTo: "2026-11-02" })).toEqual({
        success: false,
        error: "End date must not be before the start date.",
      })
    })

    it("rejects a trip longer than ten days", async () => {
      const { deps } = setup()
      expect(await submit(deps, { ...trip, dateTo: "2026-11-12" })).toEqual({
        success: false,
        error: "Trips can be at most 10 days long.",
      })
    })

    it.each([
      ["a one-day trip", "2026-11-02", 1],
      ["a ten-day trip", "2026-11-11", 10],
    ])("accepts %s", async (_label, dateTo, days) => {
      const { deps, generate } = setup({
        itinerary: generatedItinerary(days),
        replies: { "insert itinerary_days": { data: dayRows(days) } },
      })
      expect((await submit(deps, { ...trip, dateTo })).success).toBe(true)
      expect(generate.mock.calls[0][0]).toContain(`Requested dates (${days} days):`)
    })

    it.each([MIN_BUDGET, MAX_BUDGET])("accepts a budget of %i", async (budget) => {
      const { deps, calls } = setup()
      expect((await submit(deps, { ...trip, budget })).success).toBe(true)
      expect(calls[1].payload).toMatchObject({ budget: { total: budget } })
    })
  })

  describe("when generation is switched off", () => {
    it("says so without touching the database or the model", async () => {
      vi.stubEnv("FEATURE_GENERATION", "off")
      const { deps, getSupabase, generate } = setup()

      expect(await submit(deps, trip)).toEqual({ success: false, error: "Itinerary generation is switched off for now. Please try again later." })
      expect(getSupabase).not.toHaveBeenCalled()
      expect(generate).not.toHaveBeenCalled()
    })

    it("still reports a request that is not valid as not valid", async () => {
      vi.stubEnv("FEATURE_GENERATION", "off")
      const { deps } = setup()
      const result = await submit(deps, { ...trip, tripName: "a" })

      expect(result.success).toBe(false)
      expect(!result.success && result.error).not.toBe("Itinerary generation is switched off for now. Please try again later.")
    })

    it("works as before once the variable is removed", async () => {
      vi.stubEnv("FEATURE_GENERATION", "off")
      vi.unstubAllEnvs()
      const { deps } = setup()

      expect((await submit(deps, trip)).success).toBe(true)
    })
  })

  describe("security check", () => {
    it("passes the token on to the check and goes on when it passes", async () => {
      const { deps, generate } = setup()
      const verifyCaptcha = vi.fn(async () => true)

      expect((await submit({ ...deps, verifyCaptcha }, { ...trip, captchaToken: "good-token" })).success).toBe(true)
      expect(verifyCaptcha).toHaveBeenCalledExactlyOnceWith("good-token")
      expect(generate).toHaveBeenCalledTimes(1)
    })

    it("asks for the check again and touches neither the database nor the model when it fails", async () => {
      const { deps, getSupabase, generate } = setup()
      const verifyCaptcha = vi.fn(async () => false)

      expect(await submit({ ...deps, verifyCaptcha }, { ...trip, captchaToken: "bad-token" })).toEqual({
        success: false,
        error: "Please complete the security check and try again.",
      })
      expect(getSupabase).not.toHaveBeenCalled()
      expect(generate).not.toHaveBeenCalled()
    })

    it("hands the check an undefined token when the request has none", async () => {
      const { deps } = setup()
      const verifyCaptcha = vi.fn(async () => true)
      await submit({ ...deps, verifyCaptcha }, trip)

      expect(verifyCaptcha).toHaveBeenCalledExactlyOnceWith(undefined)
    })

    it("does not accept a token that is longer than 2048 characters", async () => {
      const { deps, getSupabase } = setup()

      expect((await submit(deps, { ...trip, captchaToken: "t".repeat(2049) })).success).toBe(false)
      expect(getSupabase).not.toHaveBeenCalled()
    })

    it("keeps the token out of the request to the model", async () => {
      const { deps, generate } = setup()
      await submit(deps, { ...trip, captchaToken: "secret-token-value" })

      expect(generate.mock.calls[0][0]).not.toContain("secret-token-value")
    })

    it("is not asked about the check when generation is switched off", async () => {
      vi.stubEnv("FEATURE_GENERATION", "off")
      const { deps } = setup()
      const verifyCaptcha = vi.fn(async () => true)
      await submit({ ...deps, verifyCaptcha }, trip)

      expect(verifyCaptcha).not.toHaveBeenCalled()
    })
  })

  describe("access", () => {
    it("asks the user to sign in and does not query or call the model", async () => {
      const { deps, calls, generate } = setup({ user: null })
      expect(await submit(deps, trip)).toEqual({ success: false, error: "Please sign in to create an itinerary." })
      expect(calls).toEqual([])
      expect(generate).not.toHaveBeenCalled()
    })

    it("returns a generic error when the client cannot be created", async () => {
      const failure = new Error("cookies are not available")
      const deps = { getSupabase: vi.fn().mockRejectedValue(failure), generate: vi.fn() }
      expect(await submit(deps, trip)).toEqual({ success: false, error: GENERIC_ERROR })
      expect(console.error).toHaveBeenCalledWith("Error creating itinerary:", failure)
    })
  })

  describe("limits", () => {
    it("rejects the sixth itinerary within an hour and says how long to wait", async () => {
      const { deps, generate } = setup()
      for (let i = 0; i < 5; i++) expect((await submit(deps, trip)).success).toBe(true)

      expect(await submit(deps, trip)).toEqual({
        success: false,
        error: "You've created several itineraries recently. Please try again in 60 minutes.",
      })
      expect(generate).toHaveBeenCalledTimes(5)

      vi.setSystemTime(new Date(NOW.getTime() + 30 * 60_000))
      expect(await submit(deps, trip)).toEqual({
        success: false,
        error: "You've created several itineraries recently. Please try again in 30 minutes.",
      })
    })

    it("allows another itinerary once the hour has passed", async () => {
      const { deps } = setup()
      for (let i = 0; i < 5; i++) await submit(deps, trip)

      vi.setSystemTime(new Date(NOW.getTime() + 61 * 60_000))
      expect((await submit(deps, trip)).success).toBe(true)
    })

    it("counts each user separately", async () => {
      const first = setup({ user: { id: "user-1" } })
      for (let i = 0; i < 5; i++) await submit(first.deps, trip)

      const second = setup({ user: { id: "user-2" } })
      expect((await submit(second.deps, trip)).success).toBe(true)
    })

    it("rejects the request when 20 itineraries were created in the last day", async () => {
      const { deps, calls, generate } = setup({ replies: { "select itineraries": { count: 20 } } })
      expect(await submit(deps, trip)).toEqual({
        success: false,
        error: "Daily itinerary limit reached. Please try again tomorrow.",
      })
      expect(calls).toHaveLength(1)
      expect(calls[0]).toMatchObject({
        table: "itineraries",
        action: "select",
        options: { count: "exact", head: true },
        filters: [{ op: "gte", column: "created_at", value: "2026-10-19T10:00:00.000Z" }],
      })
      expect(generate).not.toHaveBeenCalled()
    })

    it("still allows the 20th itinerary of the day", async () => {
      const { deps } = setup({ replies: { "select itineraries": { count: 19 } } })
      expect((await submit(deps, trip)).success).toBe(true)
    })

    it("does not block the request when the daily count is unavailable", async () => {
      const { deps } = setup({ replies: { "select itineraries": { error: { message: "timeout" } } } })
      expect((await submit(deps, trip)).success).toBe(true)
    })
  })

  describe("model request", () => {
    it("sends the requested dates and the trip as JSON data", async () => {
      const { deps, generate } = setup()
      await submit(deps, trip)

      const prompt = generate.mock.calls[0][0]
      expect(prompt).toContain("Requested dates (2 days): 2026-11-02, 2026-11-03")
      expect(requestIn(prompt)).toEqual({
        tripName: "Ubud trip",
        destination: { name: "Ubud, Bali, Indonesia", lat: -8.5069, lng: 115.2625 },
        homeLocation: null,
        travelType: "couple",
        travelStyles: ["nature", "culinary"],
        dietaryNeeds: ["vegetarian"],
        budgetUsd: 800,
      })
    })

    it("strips control characters from user text", async () => {
      const { deps, generate } = setup()
      await submit(deps, { ...trip, tripName: "Ubud\u0000trip", destination: { ...trip.destination, name: "Ubud\u0007, Bali" } })

      const request = requestIn(generate.mock.calls[0][0])
      expect(request.tripName).toBe("Ubud trip")
      expect(request.destination.name).toBe("Ubud , Bali")
    })

    it("includes a home location that has coordinates", async () => {
      const { deps, generate } = setup()
      await submit(deps, { ...trip, homeLocation: { name: "Jakarta", lat: -6.2, lng: 106.8 } })
      expect(requestIn(generate.mock.calls[0][0]).homeLocation).toEqual({ name: "Jakarta", lat: -6.2, lng: 106.8 })
    })

    it("ignores a home location without coordinates", async () => {
      const { deps, generate, calls } = setup()
      await submit(deps, { ...trip, homeLocation: { name: "Jakarta" } })
      expect(requestIn(generate.mock.calls[0][0]).homeLocation).toBeNull()
      expect(steps(calls)).not.toContain("update profiles")
    })

    it("returns a generic error and saves nothing when the model fails", async () => {
      const { deps, calls, generate } = setup()
      const failure = new Error("rate limited by the provider")
      generate.mockRejectedValue(failure)

      expect(await submit(deps, trip)).toEqual({ success: false, error: GENERIC_ERROR })
      expect(steps(calls)).toEqual(["select itineraries"])
      expect(console.error).toHaveBeenCalledWith("Error creating itinerary:", failure)
    })

    it("saves nothing when the model returns fewer days than requested", async () => {
      const { deps, calls } = setup({ itinerary: generatedItinerary(1) })
      expect(await submit(deps, trip)).toEqual({ success: false, error: GENERIC_ERROR })
      expect(steps(calls)).toEqual(["select itineraries"])
    })
  })

  describe("saving", () => {
    it("stores the itinerary for the signed-in user with the dates from the request", async () => {
      const { deps, calls } = setup()
      expect(await submit(deps, trip)).toEqual({ success: true, itineraryId: "itn-1" })

      expect(steps(calls)).toEqual(["select itineraries", "insert itineraries", "insert itinerary_days", "insert itinerary_activities"])
      const [, itinerary, days, activities] = calls
      expect(itinerary.payload).toEqual({
        user_id: "user-1",
        name: "Ubud slow trip",
        description: "Eco-friendly itinerary to Ubud, Bali, Indonesia",
        status: "confirmed",
        destination_name: "Ubud, Bali",
        destination_lat: -8.5069,
        destination_lng: 115.2625,
        date_from: "2026-11-02",
        date_to: "2026-11-03",
        travel_type: "couple",
        travel_styles: ["nature", "culinary"],
        dietary_needs: ["vegetarian"],
        budget: { total: 800, spent: 40, remaining: 760 },
        carbon_metrics: { saved: 40, total: 60, percentage: 40 },
        icon: "bali",
      })
      expect(days.payload).toEqual([
        { itinerary_id: "itn-1", day_index: 0, date: "2026-11-02" },
        { itinerary_id: "itn-1", day_index: 1, date: "2026-11-03" },
      ])
      const rows = activities.payload as { day_id: string; start_time: string; title: string }[]
      expect(rows.map((r) => [r.day_id, r.start_time, r.title])).toEqual([
        ["day-1", "09:00", "Rice terrace walk 1"],
        ["day-1", "13:00", "Lunch at a warung 1"],
        ["day-2", "09:00", "Rice terrace walk 2"],
        ["day-2", "13:00", "Lunch at a warung 2"],
      ])
    })

    it("falls back to the requested destination when the model names none", async () => {
      const { deps, calls } = setup({ itinerary: { ...generatedItinerary(2), destination: "" } })
      await submit(deps, trip)
      expect(calls[1].payload).toMatchObject({ destination_name: "Ubud, Bali, Indonesia" })
    })

    it("saves a home location as the profile defaults", async () => {
      const { deps, calls } = setup()
      await submit(deps, { ...trip, homeLocation: { name: "Jakarta", lat: -6.2, lng: 106.8 } })

      const update = calls.find((c) => c.action === "update")
      expect(update).toMatchObject({
        table: "profiles",
        payload: {
          home_lat: -6.2,
          home_lng: 106.8,
          preferences: { travelStyles: ["nature", "culinary"] },
          dietary_needs: ["vegetarian"],
        },
        filters: [{ op: "eq", column: "id", value: "user-1" }],
      })
    })

    it("keeps the itinerary when the profile defaults cannot be saved", async () => {
      const { deps } = setup({ replies: { "update profiles": { error: { message: "profile locked" } } } })
      const result = await submit(deps, { ...trip, homeLocation: { name: "Jakarta", lat: -6.2, lng: 106.8 } })

      expect(result).toEqual({ success: true, itineraryId: "itn-1" })
      expect(console.error).toHaveBeenCalledWith("Could not save profile defaults:", "profile locked")
    })

    it.each(["insert itinerary_days", "insert itinerary_activities"])("removes the itinerary when %s fails", async (failing) => {
      const { deps, calls } = setup({ replies: { [failing]: { error: { message: "write failed" } } } })

      expect(await submit(deps, trip)).toEqual({ success: false, error: GENERIC_ERROR })
      expect(calls.at(-1)).toMatchObject({
        table: "itineraries",
        action: "delete",
        filters: [{ op: "eq", column: "id", value: "itn-1" }],
      })
    })

    it("does not try to delete anything when the itinerary itself cannot be inserted", async () => {
      const { deps, calls } = setup({ replies: { "insert itineraries": { error: { message: "denied" } } } })

      expect(await submit(deps, trip)).toEqual({ success: false, error: GENERIC_ERROR })
      expect(steps(calls)).toEqual(["select itineraries", "insert itineraries"])
    })
  })

  describe("log", () => {
    const logged = () => JSON.parse(vi.mocked(console.log).mock.calls[0][0] as string)

    it("writes one line with the outcome, the durations and the token counts", async () => {
      const { deps } = setup()
      await submit(deps, trip)

      expect(console.log).toHaveBeenCalledTimes(1)
      expect(logged()).toEqual({
        event: "itinerary.generation",
        action: "create",
        outcome: "success",
        durationMs: 0,
        modelMs: 0,
        days: 2,
        ...usage,
      })
    })

    it("measures the time of the model call and of the whole request", async () => {
      const { deps, generate } = setup()
      generate.mockImplementation(async () => {
        vi.advanceTimersByTime(40_000)
        return modelRun()
      })
      await submit(deps, trip)

      expect(logged()).toMatchObject({ durationMs: 40_000, modelMs: 40_000 })
    })

    it("holds nothing the person wrote", async () => {
      const { deps } = setup()
      await submit(deps, {
        ...trip,
        tripName: "Secret honeymoon",
        destination: { name: "Villa Rahasia", lat: -8.5, lng: 115.2 },
        homeLocation: { name: "Jalan Mawar 12", lat: -6.2, lng: 106.8 },
      })

      const line = vi.mocked(console.log).mock.calls[0][0] as string
      for (const text of ["Secret", "honeymoon", "Villa", "Rahasia", "Mawar", "Ubud", "Rice terrace", "user-1", "@"]) expect(line).not.toContain(text)
      expect(Object.keys(JSON.parse(line)).sort()).toEqual(["action", "days", "durationMs", "event", "inputTokens", "modelMs", "outcome", "outputTokens", "totalTokens"])
    })

    it.each([
      ["invalid input", () => setup(), { ...trip, budget: 1 }],
      ["a visitor who is not signed in", () => setup({ user: null }), trip],
      ["the daily limit", () => setup({ replies: { "select itineraries": { count: 20 } } }), trip],
    ])("reports %s as rejected, without model figures", async (_label, make, input) => {
      await submit(make().deps, input)

      expect(logged()).toEqual({ event: "itinerary.generation", action: "create", outcome: "rejected", durationMs: 0 })
    })

    it("reports a failed model call as an error with its duration and no token counts", async () => {
      const { deps, generate } = setup()
      generate.mockRejectedValue(new Error("rate limited"))
      await submit(deps, trip)

      expect(logged()).toEqual({ event: "itinerary.generation", action: "create", outcome: "error", durationMs: 0, modelMs: 0, days: 2 })
    })

    it("reports a failure to save as an error that still carries the token counts", async () => {
      const { deps } = setup({ replies: { "insert itineraries": { error: { message: "denied" } } } })
      await submit(deps, trip)

      expect(logged()).toMatchObject({ outcome: "error", ...usage })
    })
  })

  describe("error reports", () => {
    it("sends a failed model call to the error tracker with the place it came from", async () => {
      const { deps, generate } = setup()
      const failure = new Error("rate limited")
      generate.mockRejectedValue(failure)
      await submit(deps, trip)

      expect(reportError).toHaveBeenCalledExactlyOnceWith(failure, "create")
    })

    it("sends a failure to save too", async () => {
      const failure = { message: "denied" }
      const { deps } = setup({ replies: { "insert itineraries": { error: failure } } })
      await submit(deps, trip)

      expect(reportError).toHaveBeenCalledExactlyOnceWith(failure, "create")
    })

    it.each([
      ["invalid input", () => setup(), { ...trip, budget: 1 }],
      ["a visitor who is not signed in", () => setup({ user: null }), trip],
      ["the daily limit", () => setup({ replies: { "select itineraries": { count: 20 } } }), trip],
    ])("does not send %s", async (_label, make, input) => {
      await submit(make().deps, input)

      expect(reportError).not.toHaveBeenCalled()
    })
  })
})
