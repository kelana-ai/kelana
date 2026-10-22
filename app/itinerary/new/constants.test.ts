import { describe, expect, it } from "vitest"

import { DIETARY_NEED_IDS, MAX_BUDGET, MIN_BUDGET, TRAVEL_STYLE_IDS, TRAVEL_TYPES } from "@/lib/trip-options"
import { budgetRanges, dietaryNeeds, getBudgetTabValue, travelStyles, travelTypeOptions } from "./constants"

describe("getBudgetTabValue", () => {
  it.each(budgetRanges)("picks $label for exactly $value", ({ value, label }) => {
    expect(getBudgetTabValue(value)).toBe(label)
  })

  it.each([
    [100, "Economy"],
    [0, "Economy"],
    [-500, "Economy"],
    [10_000, "Ultra Luxury"],
    [10_001, "Ultra Luxury"],
    [1_000_000, "Ultra Luxury"],
  ])("clamps %i to %s", (value, label) => {
    expect(getBudgetTabValue(value)).toBe(label)
  })

  it.each([
    [699, "Economy"],
    [700, "Economy"],
    [701, "Standard"],
    [2849, "Standard"],
    [2850, "Standard"],
    [2851, "Premium"],
    [5999, "Premium"],
    [6000, "Premium"],
    [6001, "Luxury"],
    [8749, "Luxury"],
    [8750, "Luxury"],
    [8751, "Ultra Luxury"],
  ])("puts %i in %s, with a tie going to the cheaper range", (value, label) => {
    expect(getBudgetTabValue(value)).toBe(label)
  })

  it("covers every budget the form accepts with a range that exists", () => {
    const labels = new Set(budgetRanges.map((range) => range.label))
    for (let value = MIN_BUDGET; value <= MAX_BUDGET; value += 50) expect(labels).toContain(getBudgetTabValue(value))
  })
})

describe("the options in the form", () => {
  it("offer the same ids the server accepts", () => {
    expect(travelTypeOptions.map((option) => option.id)).toEqual([...TRAVEL_TYPES])
    expect(travelStyles.map((style) => style.id)).toEqual([...TRAVEL_STYLE_IDS])
    expect(dietaryNeeds.map((need) => need.id)).toEqual([...DIETARY_NEED_IDS])
  })

  it("keep every budget range inside the allowed budget", () => {
    for (const { value } of budgetRanges) {
      expect(value).toBeGreaterThanOrEqual(MIN_BUDGET)
      expect(value).toBeLessThanOrEqual(MAX_BUDGET)
    }
  })
})
