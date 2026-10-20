import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { checkRateLimit, resetRateLimits } from "./rate-limit"

const HOUR = 3_600_000

describe("checkRateLimit", () => {
  beforeEach(resetRateLimits)
  afterEach(() => vi.useRealTimers())

  it("allows calls up to the limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("a", 3, HOUR, 1000)).toEqual({ ok: true, retryAfterSec: 0 })
    }
  })

  it("rejects the call over the limit and reports when the oldest hit expires", () => {
    checkRateLimit("a", 2, HOUR, 0)
    checkRateLimit("a", 2, HOUR, 600_000)
    expect(checkRateLimit("a", 2, HOUR, 1_200_000)).toEqual({ ok: false, retryAfterSec: 2400 })
  })

  it("frees a slot once the oldest hit leaves the window", () => {
    checkRateLimit("a", 2, HOUR, 0)
    checkRateLimit("a", 2, HOUR, 600_000)
    expect(checkRateLimit("a", 2, HOUR, HOUR - 1).ok).toBe(false)
    expect(checkRateLimit("a", 2, HOUR, HOUR).ok).toBe(true)
  })

  it("does not count rejected calls", () => {
    checkRateLimit("a", 1, HOUR, 0)
    expect(checkRateLimit("a", 1, HOUR, 10).ok).toBe(false)
    expect(checkRateLimit("a", 1, HOUR, HOUR).ok).toBe(true)
  })

  it("tracks keys separately", () => {
    checkRateLimit("a", 1, HOUR, 0)
    expect(checkRateLimit("b", 1, HOUR, 0).ok).toBe(true)
  })

  it("rounds the wait up to whole seconds", () => {
    checkRateLimit("a", 1, 1000, 0)
    expect(checkRateLimit("a", 1, 1000, 1)).toEqual({ ok: false, retryAfterSec: 1 })
  })

  it("forgets every key on reset", () => {
    checkRateLimit("a", 1, HOUR, 0)
    resetRateLimits()
    expect(checkRateLimit("a", 1, HOUR, 0).ok).toBe(true)
  })

  it("reads the system clock when no time is given", () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    checkRateLimit("a", 1, 1000)
    vi.setSystemTime(500)
    expect(checkRateLimit("a", 1, 1000)).toEqual({ ok: false, retryAfterSec: 1 })
    vi.setSystemTime(1000)
    expect(checkRateLimit("a", 1, 1000).ok).toBe(true)
  })
})
