import { describe, expect, it, vi } from "vitest"

import { requestItinerary } from "./request-itinerary"
import { encodeEvent, type StreamEvent } from "./stream"

const answer = (events: StreamEvent[], init: ResponseInit = { status: 200 }) => vi.fn(async () => new Response(events.map(encodeEvent).join(""), init))

describe("requestItinerary", () => {
  it("posts the trip as JSON to the stream route", async () => {
    const fetchImpl = answer([{ type: "done", itineraryId: "itn-1" }])
    const trip = { tripName: "Ubud trip", budget: 800 }

    await requestItinerary(trip, () => {}, fetchImpl)

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/api/itinerary")
    expect(init).toMatchObject({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(trip) })
  })

  it("reports each step of the plan and returns the id of the itinerary", async () => {
    const steps = [{ activities: ["Walk"] }]
    const fetchImpl = answer([
      { type: "progress", days: [] },
      { type: "progress", days: steps },
      { type: "done", itineraryId: "itn-1" },
    ])
    const onProgress = vi.fn()

    expect(await requestItinerary({}, onProgress, fetchImpl)).toBe("itn-1")
    expect(onProgress.mock.calls).toEqual([[[]], [steps]])
  })

  it("fails with the message of an error event", async () => {
    const fetchImpl = answer([{ type: "error", message: "Daily itinerary limit reached. Please try again tomorrow." }])

    await expect(requestItinerary({}, () => {}, fetchImpl)).rejects.toThrow("Daily itinerary limit reached. Please try again tomorrow.")
  })

  it("stops at the first error even after some progress", async () => {
    const fetchImpl = answer([
      { type: "progress", days: [{ activities: ["Walk"] }] },
      { type: "error", message: "boom" },
    ])
    const onProgress = vi.fn()

    await expect(requestItinerary({}, onProgress, fetchImpl)).rejects.toThrow("boom")
    expect(onProgress).toHaveBeenCalledTimes(1)
  })

  it("fails when the stream ends before the itinerary is ready", async () => {
    await expect(requestItinerary({}, () => {}, answer([{ type: "progress", days: [] }]))).rejects.toThrow("interrupted")
  })

  it.each([
    ["an error status", answer([], { status: 500 })],
    ["a refused request", answer([], { status: 415 })],
    ["a response without a body", vi.fn(async () => new Response(null, { status: 200 }))],
  ])("fails for %s", async (_label, fetchImpl) => {
    await expect(requestItinerary({}, () => {}, fetchImpl)).rejects.toThrow("Failed to generate itinerary")
  })
})
