import { describe, expect, it } from "vitest"

import { toggleItem, USERNAME_MESSAGE, USERNAME_PATTERN, validateProfile, WEBSITE_MESSAGE } from "./profile"

describe("USERNAME_PATTERN", () => {
  it.each(["abc", "a_b.c-d", "Ayu123", "x".repeat(30)])("accepts %s", (name) => {
    expect(USERNAME_PATTERN.test(name)).toBe(true)
  })

  it.each(["ab", "x".repeat(31), "a b c", "ayu!", "ayu@home", "ünïcode"])("rejects %s", (name) => {
    expect(USERNAME_PATTERN.test(name)).toBe(false)
  })
})

describe("validateProfile", () => {
  it("accepts an empty username and an empty website", () => {
    expect(validateProfile({ username: "", website: "" })).toBeNull()
    expect(validateProfile({ username: "   ", website: "   " })).toBeNull()
  })

  it("accepts a valid username and an http or https website, ignoring surrounding spaces", () => {
    expect(validateProfile({ username: " ayu_l ", website: " https://example.com " })).toBeNull()
    expect(validateProfile({ username: "ayu", website: "HTTP://example.com" })).toBeNull()
  })

  it("explains an invalid username", () => {
    expect(validateProfile({ username: "a!", website: "" })).toBe(USERNAME_MESSAGE)
  })

  it.each(["example.com", "ftp://example.com", "javascript:alert(1)"])("explains a website like %s", (website) => {
    expect(validateProfile({ username: "", website })).toBe(WEBSITE_MESSAGE)
  })

  it("reports the username before the website", () => {
    expect(validateProfile({ username: "a!", website: "nope" })).toBe(USERNAME_MESSAGE)
  })
})

describe("toggleItem", () => {
  it("adds an item that is missing and removes one that is present", () => {
    expect(toggleItem(["a"], "b")).toEqual(["a", "b"])
    expect(toggleItem(["a", "b"], "a")).toEqual(["b"])
  })

  it("does not change the list it was given", () => {
    const list = ["a"]
    toggleItem(list, "b")
    expect(list).toEqual(["a"])
  })
})
