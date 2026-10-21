import { describe, expect, it } from "vitest"

import { displayName, initialOf } from "./display-name"

describe("displayName", () => {
  it("prefers the full name, then the username, then the part of the email before the @", () => {
    expect(displayName({ full_name: "Ayu Lestari", username: "ayu" }, "ayu@example.com")).toBe("Ayu Lestari")
    expect(displayName({ full_name: "", username: "ayu" }, "ayu.l@example.com")).toBe("ayu")
    expect(displayName({ full_name: null, username: null }, "ayu.l@example.com")).toBe("ayu.l")
  })

  it("falls back to the given text when nothing is known", () => {
    expect(displayName(null, null)).toBe("")
    expect(displayName(undefined, undefined, "Traveler")).toBe("Traveler")
    expect(displayName({ full_name: "", username: "" }, "", "Traveler")).toBe("Traveler")
  })
})

describe("initialOf", () => {
  it("uses the first letter of the full name, upper-cased", () => {
    expect(initialOf({ full_name: "ayu lestari" }, "zed@example.com")).toBe("A")
  })

  it("uses the first letter of the email when there is no full name", () => {
    expect(initialOf({ full_name: "" }, "zed@example.com")).toBe("Z")
    expect(initialOf(null, "zed@example.com")).toBe("Z")
  })

  it("returns U when nothing is known", () => {
    expect(initialOf(null, null)).toBe("U")
    expect(initialOf({ full_name: null }, "")).toBe("U")
  })
})
