import { describe, expect, it } from "vitest"

import { assertNotProduction, PRODUCTION_SUPABASE_REF } from "./guard"

describe("assertNotProduction", () => {
  it("refuses the production project", () => {
    expect(() => assertNotProduction(`https://${PRODUCTION_SUPABASE_REF}.supabase.co`)).toThrow("Refusing to run against the production database")
  })

  it.each(["https://vaubnupaedvylwwekwee.supabase.co", "http://127.0.0.1:54321", "", undefined])("lets %j through", (url) => {
    expect(() => assertNotProduction(url)).not.toThrow()
  })
})
