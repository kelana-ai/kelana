import type { PartialItinerary } from "../generation"

export interface PlanDay {
  activities: string[]
}

export type StreamEvent =
  | { type: "progress"; days: PlanDay[] }
  | { type: "done"; itineraryId: string }
  | { type: "error"; message: string }

// the last activity of the last day is still being written, so it is left out until the next one starts
export function finishedActivities(partial: PartialItinerary): PlanDay[] {
  const days = (partial.days ?? []).filter((day) => day !== undefined)
  return days.map((day, index) => {
    const titles = (day.activities ?? []).map((activity) => activity?.title ?? "")
    const finished = index === days.length - 1 ? titles.slice(0, -1) : titles
    return { activities: finished.filter(Boolean) }
  })
}

export const encodeEvent = (event: StreamEvent) => `${JSON.stringify(event)}\n`

export async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  for (;;) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })

    let newline = buffer.indexOf("\n")
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line) yield JSON.parse(line) as StreamEvent
      newline = buffer.indexOf("\n")
    }
    if (done) break
  }
  if (buffer.trim()) yield JSON.parse(buffer) as StreamEvent
}
