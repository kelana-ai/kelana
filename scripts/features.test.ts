import { readdirSync, readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const FLOWS = ["sign-up", "create-trip", "refine-trip", "download-trip", "delete-account"]

const read = (path: string) => readFileSync(path, "utf8")
const features = readdirSync("e2e/features").filter((file) => file.endsWith(".feature"))

const scenarios = features.flatMap((file) =>
  read(`e2e/features/${file}`)
    .split(/^\s*Scenario:/m)
    .slice(1)
    .map((block) => ({ file, title: block.split("\n")[0].trim(), steps: block.split("\n").slice(1).map((line) => line.trim()) })),
)

const testTitles = new Set(
  readdirSync("e2e")
    .filter((file) => file.endsWith(".spec.ts"))
    .flatMap((file) => [...read(`e2e/${file}`).matchAll(/\btest\(\s*(["'`])(.+?)\1/g)].map((match) => match[2].toLowerCase())),
)

describe("acceptance scenarios", () => {
  it.each(FLOWS)("have a feature file for %s", (flow) => {
    expect(features).toContain(`${flow}.feature`)
  })

  it("start every feature with a name and at least one scenario", () => {
    for (const file of features) {
      const text = read(`e2e/features/${file}`)
      expect(text).toMatch(/^Feature: .+/m)
      expect(scenarios.some((scenario) => scenario.file === file)).toBe(true)
    }
  })

  it("have a unique title each", () => {
    const titles = scenarios.map((scenario) => scenario.title.toLowerCase())
    expect(new Set(titles).size).toBe(titles.length)
  })

  it.each(scenarios.map((scenario) => [scenario.file, scenario.title, scenario.steps] as const))("%s: %s has a Given or When and a Then", (_file, _title, steps) => {
    expect(steps.some((step) => /^(Given|When) /.test(step))).toBe(true)
    expect(steps.some((step) => /^Then /.test(step))).toBe(true)
  })

  it.each(scenarios.map((scenario) => [scenario.file, scenario.title] as const))("%s: %s maps to an end-to-end test of the same name", (_file, title) => {
    expect(testTitles.has(title.toLowerCase())).toBe(true)
  })
})
