import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { generatedItinerary, modelRun, usage } from "@/test/fixtures"
import { runTraced, withTrace, type Trace } from "./trace"

const logged = () => vi.mocked(console.log).mock.calls.map(([line]) => JSON.parse(line as string))

describe("runTraced", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the itinerary and records the time and the tokens of the call", async () => {
    const trace: Trace = {}
    const generate = vi.fn(async () => {
      vi.advanceTimersByTime(1500)
      return modelRun(generatedItinerary(1))
    })

    expect(await runTraced(trace, generate, "prompt")).toEqual(generatedItinerary(1))
    expect(generate).toHaveBeenCalledWith("prompt")
    expect(trace).toEqual({ modelMs: 1500, ...usage })
  })

  it("records the time of a call that fails and passes the failure on", async () => {
    const trace: Trace = {}
    const failure = new Error("timeout")
    const generate = vi.fn(async () => {
      vi.advanceTimersByTime(900)
      throw failure
    })

    await expect(runTraced(trace, generate, "prompt")).rejects.toBe(failure)
    expect(trace).toEqual({ modelMs: 900 })
  })
})

describe("withTrace", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("logs a successful run once, with its duration", async () => {
    const result = await withTrace("create", async () => {
      vi.advanceTimersByTime(250)
      return { success: true as const }
    })

    expect(result).toEqual({ success: true })
    expect(logged()).toEqual([{ event: "itinerary.generation", action: "create", outcome: "success", durationMs: 250 }])
  })

  it("logs a run that returned a failure as rejected unless it marked an error", async () => {
    await withTrace("refine", async () => ({ success: false }))
    await withTrace("refine", async (trace) => {
      trace.outcome = "error"
      return { success: false }
    })

    expect(logged().map((line) => line.outcome)).toEqual(["rejected", "error"])
  })

  it("logs a run that throws as an error and throws on", async () => {
    const failure = new Error("unexpected")

    await expect(
      withTrace("create", async () => {
        throw failure
      }),
    ).rejects.toBe(failure)
    expect(logged()).toEqual([{ event: "itinerary.generation", action: "create", outcome: "error", durationMs: 0 }])
  })
})
