import { describe, expect, it } from "vitest"

import type { SubmitItineraryResult } from "@/app/itinerary/new/submit"
import type { PartialItinerary } from "@/app/itinerary/generation"
import { streamResponse } from "./stream"

const eventsOf = async (response: Response) =>
  (await response.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))

const writing = (...steps: PartialItinerary[]) => async (onPartial: (partial: PartialItinerary) => void): Promise<SubmitItineraryResult> => {
  for (const step of steps) onPartial(step)
  return { success: true, itineraryId: "itn-1" }
}

describe("streamResponse", () => {
  it("sends the plan as it grows and finishes with the id of the itinerary", async () => {
    const response = streamResponse(
      writing(
        { days: [{ activities: [{ title: "Wa" }] }] },
        { days: [{ activities: [{ title: "Walk" }, { title: "Lu" }] }] },
        { days: [{ activities: [{ title: "Walk" }, { title: "Lunch" }] }, { activities: [{ title: "Ma" }] }] },
      ),
    )

    expect(await eventsOf(response)).toEqual([
      { type: "progress", days: [{ activities: [] }] },
      { type: "progress", days: [{ activities: ["Walk"] }] },
      { type: "progress", days: [{ activities: ["Walk", "Lunch"] }, { activities: [] }] },
      { type: "done", itineraryId: "itn-1" },
    ])
  })

  it("does not repeat a step that has not changed", async () => {
    const same = { days: [{ activities: [{ title: "Walk" }, { title: "Lu" }] }] }
    const response = streamResponse(writing(same, { days: [{ activities: [{ title: "Walk" }, { title: "Lun" }] }] }, same))

    expect((await eventsOf(response)).map((event) => event.type)).toEqual(["progress", "done"])
  })

  it("is sent as lines of JSON that are not cached", async () => {
    const response = streamResponse(writing())

    expect(response.headers.get("content-type")).toBe("application/x-ndjson; charset=utf-8")
    expect(response.headers.get("cache-control")).toBe("no-store")
  })

  it("sends the error of a request that was refused", async () => {
    const response = streamResponse(async () => ({ success: false, error: "Daily itinerary limit reached. Please try again tomorrow." }))

    expect(await eventsOf(response)).toEqual([{ type: "error", message: "Daily itinerary limit reached. Please try again tomorrow." }])
  })

  it("keeps the plan it has sent and then reports a failure without details", async () => {
    const response = streamResponse(async (onPartial) => {
      onPartial({ days: [{ activities: [{ title: "Walk" }, { title: "Lu" }] }] })
      throw new Error("database password is hunter2")
    })

    const events = await eventsOf(response)
    expect(events.map((event) => event.type)).toEqual(["progress", "error"])
    expect(events[1]).toEqual({ type: "error", message: "We couldn't generate your itinerary. Please try again." })
  })
})
