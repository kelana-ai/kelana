import { describe, expect, it } from "vitest"

import { firstErrorMessage } from "./form-errors"

describe("firstErrorMessage", () => {
  it("reads direct and nested messages and ignores refs", () => {
    expect(firstErrorMessage({ message: "direct" })).toBe("direct")
    expect(firstErrorMessage({ name: { message: "nested", type: "x", ref: { message: "ignored" } } })).toBe("nested")
    expect(firstErrorMessage(undefined)).toBe("")
    expect(firstErrorMessage({ type: "x" })).toBe("")
  })
})
