import { describe, expect, it } from "vitest"

import { isEnabled } from "./flags"

describe("isEnabled", () => {
  it("is on when the variable is not set", () => {
    expect(isEnabled("generation", {})).toBe(true)
  })

  it.each(["off", "OFF", " off ", "false", "0", "no"])("is off when the variable is %j", (value) => {
    expect(isEnabled("generation", { FEATURE_GENERATION: value })).toBe(false)
  })

  it.each(["on", "true", "1", "", "anything else"])("stays on when the variable is %j", (value) => {
    expect(isEnabled("generation", { FEATURE_GENERATION: value })).toBe(true)
  })

  it("reads the process environment by default", () => {
    process.env.FEATURE_GENERATION = "off"
    try {
      expect(isEnabled("generation")).toBe(false)
    } finally {
      delete process.env.FEATURE_GENERATION
    }
    expect(isEnabled("generation")).toBe(true)
  })
})
