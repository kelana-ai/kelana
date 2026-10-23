import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { logGeneration } from "./log"

describe("logGeneration", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("writes one line of JSON that names the event and carries the figures", () => {
    logGeneration({ action: "create", outcome: "success", durationMs: 41_200, modelMs: 40_800, inputTokens: 1200, outputTokens: 3400, totalTokens: 4600, days: 3 })

    expect(console.log).toHaveBeenCalledTimes(1)
    const line = vi.mocked(console.log).mock.calls[0][0] as string
    expect(line).not.toContain("\n")
    expect(JSON.parse(line)).toEqual({
      event: "itinerary.generation",
      action: "create",
      outcome: "success",
      durationMs: 41_200,
      modelMs: 40_800,
      inputTokens: 1200,
      outputTokens: 3400,
      totalTokens: 4600,
      days: 3,
    })
  })

  it("leaves out the figures that are not known", () => {
    logGeneration({ action: "refine", outcome: "rejected", durationMs: 12 })

    expect(JSON.parse(vi.mocked(console.log).mock.calls[0][0] as string)).toEqual({
      event: "itinerary.generation",
      action: "refine",
      outcome: "rejected",
      durationMs: 12,
    })
  })
})
