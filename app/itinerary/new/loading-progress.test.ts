import { describe, expect, it } from "vitest"

import { nextIndex, nextProgress } from "./loading-progress"

describe("nextProgress", () => {
  it.each([
    [0, 1.5],
    [69.5, 71],
    [70, 70.7],
    [89.5, 90.2],
    [90, 90.3],
    [95, 95.3],
  ])("moves %d to %d", (previous, expected) => {
    expect(nextProgress(previous)).toBeCloseTo(expected, 10)
  })

  it("slows down in three stages", () => {
    const step = (from: number) => nextProgress(from) - from
    expect(step(10)).toBeGreaterThan(step(75))
    expect(step(75)).toBeGreaterThan(step(95))
  })

  it("never reaches 100", () => {
    let progress = 0
    for (let i = 0; i < 2000; i++) progress = nextProgress(progress)
    expect(progress).toBe(99)
    expect(nextProgress(98.9)).toBe(99)
  })
})

describe("nextIndex", () => {
  it("steps forward and wraps around", () => {
    expect(nextIndex(0, 3)).toBe(1)
    expect(nextIndex(2, 3)).toBe(0)
  })

  it("stays at zero for a list of one", () => {
    expect(nextIndex(0, 1)).toBe(0)
  })
})
