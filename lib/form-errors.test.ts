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

describe("firstErrorMessage edges", () => {
  it.each(["text", 42, true, null])("finds no message in %j", (value) => {
    expect(firstErrorMessage(value)).toBe("")
  })

  it.each(["ref", "type", "types"])("does not look inside the key %s", (key) => {
    expect(firstErrorMessage({ [key]: { message: "hidden" } })).toBe("")
  })

  it("keeps looking in the next key when an earlier one holds no message", () => {
    expect(firstErrorMessage({ first: { detail: 1 }, second: { message: "found" } })).toBe("found")
  })

  it("falls through to the nested messages when the direct message is empty", () => {
    expect(firstErrorMessage({ message: "", inner: { message: "deep" } })).toBe("deep")
    expect(firstErrorMessage({ message: 42, inner: { message: "deep" } })).toBe("deep")
  })

  it("returns the first message in key order", () => {
    expect(firstErrorMessage({ a: { message: "one" }, b: { message: "two" } })).toBe("one")
  })
})
