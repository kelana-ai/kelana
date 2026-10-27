import { describe, expect, it } from "vitest"

import { avatarPath, avatarProblem, MAX_AVATAR_BYTES, ownedAvatar } from "./avatar"

describe("avatarProblem", () => {
  it.each(["image/png", "image/jpeg", "image/webp", "image/gif"])("accepts %s up to 2 MB", (type) => {
    expect(avatarProblem({ type, size: 1000 })).toBeNull()
    expect(avatarProblem({ type, size: MAX_AVATAR_BYTES })).toBeNull()
  })

  it("rejects an image over 2 MB", () => {
    expect(avatarProblem({ type: "image/png", size: MAX_AVATAR_BYTES + 1 })).toBe("The image must be 2 MB or smaller.")
  })

  it.each(["text/plain", "image/svg+xml", "application/pdf", "", "constructor", "toString"])("rejects the type %j", (type) => {
    expect(avatarProblem({ type, size: 10 })).toBe("Please choose a PNG, JPEG, WebP or GIF image.")
  })

  it("checks the type before the size", () => {
    expect(avatarProblem({ type: "text/plain", size: MAX_AVATAR_BYTES * 2 })).toBe("Please choose a PNG, JPEG, WebP or GIF image.")
  })
})

describe("avatarPath", () => {
  it("puts the file in the folder of the user with an extension for its type", () => {
    expect(avatarPath("user-1", "image/jpeg", "abc")).toBe("user-1/abc.jpg")
    expect(avatarPath("user-1", "image/png", "abc")).toBe("user-1/abc.png")
  })
})

describe("ownedAvatar", () => {
  it("returns a path inside the folder of the user", () => {
    expect(ownedAvatar("user-1/old.png", "user-1")).toBe("user-1/old.png")
  })

  it.each([null, "", "https://example.com/me.png", "http://example.com/me.png", "user-2/old.png", "user-10/old.png"])(
    "returns null for %j",
    (path) => {
      expect(ownedAvatar(path, "user-1")).toBeNull()
    },
  )
})

describe("avatar file names", () => {
  it.each([
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
  ])("gives %s the extension %s", (type, extension) => {
    expect(avatarPath("user-1", type, "abc")).toBe(`user-1/abc.${extension}`)
  })

  it("never treats an address as a path, even when the folder of the user starts with http", () => {
    expect(ownedAvatar("httpuser/old.png", "httpuser")).toBeNull()
    expect(ownedAvatar("https://httpuser/old.png", "httpuser")).toBeNull()
  })
})
