import { describe, expect, it } from "vitest"

import { MINIMUM, problems, scoresOf, table, type Scores } from "./lighthouse"

const scores = (patch: Partial<Scores> = {}): Scores => ({ performance: 95, accessibility: 100, "best-practices": 100, seo: 100, ...patch })

describe("scoresOf", () => {
  it("turns the category scores into whole percentages", () => {
    const report = {
      categories: {
        performance: { score: 0.874 },
        accessibility: { score: 1 },
        "best-practices": { score: 0.955 },
        seo: { score: 0.9 },
      },
    }
    expect(scoresOf(report)).toEqual({ performance: 87, accessibility: 100, "best-practices": 96, seo: 90 })
  })

  it("counts a category without a score as zero", () => {
    expect(scoresOf({ categories: { performance: { score: null } } })).toEqual({ performance: 0, accessibility: 0, "best-practices": 0, seo: 0 })
  })
})

describe("problems", () => {
  it("finds nothing when every score reaches its minimum exactly", () => {
    expect(problems("/", MINIMUM)).toEqual({ fail: [], warn: [] })
  })

  it("only warns about performance, because it varies from run to run", () => {
    expect(problems("/", scores({ performance: 69 }))).toEqual({ fail: [], warn: ["/: performance is 69, the minimum is 70"] })
  })

  it.each(["accessibility", "best-practices", "seo"] as const)("fails when %s is one point under its minimum", (category) => {
    const result = problems("/about", scores({ [category]: MINIMUM[category] - 1 }))
    expect(result.warn).toEqual([])
    expect(result.fail).toEqual([`/about: ${category} is ${MINIMUM[category] - 1}, the minimum is ${MINIMUM[category]}`])
  })
})

describe("table", () => {
  it("lists a row for each page under a header", () => {
    expect(
      table([
        { path: "/", scores: scores() },
        { path: "/login", scores: scores({ seo: 91 }) },
      ]),
    ).toBe(
      [
        "| Page | performance | accessibility | best-practices | seo |",
        "| --- | --- | --- | --- | --- |",
        "| / | 95 | 100 | 100 | 100 |",
        "| /login | 95 | 100 | 100 | 91 |",
      ].join("\n"),
    )
  })
})
