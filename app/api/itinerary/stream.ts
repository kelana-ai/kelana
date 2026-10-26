import { encodeEvent, finishedActivities, type StreamEvent } from "@/app/itinerary/new/stream"
import type { SubmitItineraryResult } from "@/app/itinerary/new/submit"
import type { PartialItinerary } from "@/app/itinerary/generation"

const FAILED = "We couldn't generate your itinerary. Please try again."

export function streamResponse(run: (onPartial: (partial: PartialItinerary) => void) => Promise<SubmitItineraryResult>) {
  const encoder = new TextEncoder()

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(encodeEvent(event)))
      let sent = ""

      try {
        const result = await run((partial) => {
          const days = finishedActivities(partial)
          const key = JSON.stringify(days)
          if (key === sent) return
          sent = key
          send({ type: "progress", days })
        })
        send(result.success ? { type: "done", itineraryId: result.itineraryId } : { type: "error", message: result.error })
      } catch {
        send({ type: "error", message: FAILED })
      }
      controller.close()
    },
  })

  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } })
}
