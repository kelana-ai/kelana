import { readdirSync } from "node:fs"

import { describe, expect, it } from "vitest"

const FIRST_WITH_ROLLBACK = "20261023"

const migrations = readdirSync("supabase/migrations").filter((file) => file.endsWith(".sql"))
const rollbacks = new Set(readdirSync("supabase/rollbacks"))
const covered = migrations.filter((file) => file >= FIRST_WITH_ROLLBACK)

describe("migrations", () => {
  it("are named with a version and a name", () => {
    for (const file of migrations) expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/)
  })

  it("include at least one that must have a rollback script", () => {
    expect(covered.length).toBeGreaterThan(0)
  })

  it.each(covered)("%s has a rollback script with the same name", (file) => {
    expect(rollbacks.has(file)).toBe(true)
  })

  it("have no rollback script without a migration", () => {
    for (const file of rollbacks) expect(migrations).toContain(file)
  })
})
