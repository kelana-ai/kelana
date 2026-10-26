import { describe, expect, it } from "vitest"

import { encodeEvent, finishedActivities, readEvents, type StreamEvent } from "./stream"

const streamOf = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk))
      controller.close()
    },
  })

async function collect(body: ReadableStream<Uint8Array>) {
  const events: StreamEvent[] = []
  for await (const event of readEvents(body)) events.push(event)
  return events
}

describe("finishedActivities", () => {
  it("is empty before the model has written a day", () => {
    expect(finishedActivities({})).toEqual([])
    expect(finishedActivities({ days: [] })).toEqual([])
  })

  it("leaves out the last activity of the last day because it is still being written", () => {
    const partial = { days: [{ activities: [{ title: "Walk" }, { title: "Lun" }] }] }

    expect(finishedActivities(partial)).toEqual([{ activities: ["Walk"] }])
  })

  it("keeps every activity of the days before the last one", () => {
    const partial = {
      days: [{ activities: [{ title: "Walk" }, { title: "Lunch" }] }, { activities: [{ title: "Market" }, { title: "Yo" }] }],
    }

    expect(finishedActivities(partial)).toEqual([{ activities: ["Walk", "Lunch"] }, { activities: ["Market"] }])
  })

  it("shows a day that has no activity yet and skips titles that are missing", () => {
    expect(finishedActivities({ days: [{ activities: [] }] })).toEqual([{ activities: [] }])
    expect(finishedActivities({ days: [{}] })).toEqual([{ activities: [] }])
    expect(finishedActivities({ days: [{ activities: [{}, undefined, { title: "Walk" }, { title: "x" }] }] })).toEqual([{ activities: ["Walk"] }])
  })

  it("ignores a day that has not started", () => {
    expect(finishedActivities({ days: [undefined, { activities: [{ title: "Walk" }, { title: "L" }] }] })).toEqual([{ activities: ["Walk"] }])
  })
})

describe("encodeEvent", () => {
  it("writes one line of JSON that ends with a line break", () => {
    const line = encodeEvent({ type: "done", itineraryId: "itn-1" })

    expect(line).toBe('{"type":"done","itineraryId":"itn-1"}\n')
  })
})

describe("readEvents", () => {
  it("reads one event for each line", async () => {
    const lines = [{ type: "progress", days: [{ activities: ["Walk"] }] }, { type: "done", itineraryId: "itn-1" }] satisfies StreamEvent[]

    expect(await collect(streamOf(lines.map(encodeEvent).join("")))).toEqual(lines)
  })

  it("puts together a line that arrives in pieces, even in the middle of a character", async () => {
    const line = encodeEvent({ type: "error", message: "Gagal membuat rencana perjalanan, coba lagi \u00e9" })
    const bytes = new TextEncoder().encode(line)
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 40))
        controller.enqueue(bytes.slice(40, bytes.length - 3))
        controller.enqueue(bytes.slice(bytes.length - 3))
        controller.close()
      },
    })

    expect(await collect(body)).toEqual([{ type: "error", message: "Gagal membuat rencana perjalanan, coba lagi \u00e9" }])
  })

  it("reads several events from one piece and skips empty lines", async () => {
    const piece = `${encodeEvent({ type: "progress", days: [] })}\n\n${encodeEvent({ type: "done", itineraryId: "a" })}`

    expect((await collect(streamOf(piece))).map((event) => event.type)).toEqual(["progress", "done"])
  })

  it("reads a last line that has no line break", async () => {
    expect(await collect(streamOf('{"type":"done","itineraryId":"a"}'))).toEqual([{ type: "done", itineraryId: "a" }])
  })

  it("gives nothing for an empty stream", async () => {
    expect(await collect(streamOf())).toEqual([])
  })

  it("fails on a line that is not JSON", async () => {
    await expect(collect(streamOf("not json\n"))).rejects.toThrow()
  })
})
