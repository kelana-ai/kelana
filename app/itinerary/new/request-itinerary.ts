import { readEvents, type PlanDay } from "./stream"

export async function requestItinerary(input: unknown, onProgress: (days: PlanDay[]) => void, fetchImpl: typeof fetch = fetch) {
  const response = await fetchImpl("/api/itinerary", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!response.ok || !response.body) throw new Error("Failed to generate itinerary")

  for await (const event of readEvents(response.body)) {
    if (event.type === "progress") onProgress(event.days)
    else if (event.type === "done") return event.itineraryId
    else throw new Error(event.message)
  }
  throw new Error("The connection was interrupted before the itinerary was ready")
}
