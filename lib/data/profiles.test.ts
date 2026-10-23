import type { User } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { deleteAccount, loadProfile, saveAvatarPath, savePreferences, saveProfile, saveTripDefaults } from "./profiles"

const NOW = new Date("2026-10-21T10:00:00Z")

function setup(replies: Record<string, Reply> = {}) {
  return fakeSupabase({ reply: (call) => replies[`${call.action} ${call.table}`] ?? {} })
}

describe("saveProfile", () => {
  it("stores trimmed values and turns empty ones into null", async () => {
    const { client, calls } = setup()
    const result = await saveProfile(client, "user-1", { fullName: "  Ayu L  ", username: "", website: "   " }, NOW)

    expect(result).toEqual({ ok: true })
    expect(calls[0]).toMatchObject({
      table: "profiles",
      action: "update",
      payload: { full_name: "Ayu L", username: null, website: null, updated_at: "2026-10-21T10:00:00.000Z" },
      filters: [{ op: "eq", column: "id", value: "user-1" }],
    })
  })

  it("reports a username that is already taken", async () => {
    const { client } = setup({ "update profiles": { error: { message: "duplicate", code: "23505" } as { message: string } } })
    expect(await saveProfile(client, "user-1", { fullName: "", username: "ayu", website: "" })).toEqual({
      ok: false,
      reason: "username-taken",
    })
  })

  it("throws any other database error", async () => {
    const failure = { message: "connection lost", code: "08006" }
    const { client } = setup({ "update profiles": { error: failure } })
    await expect(saveProfile(client, "user-1", { fullName: "", username: "", website: "" })).rejects.toBe(failure)
  })
})

describe("saveAvatarPath", () => {
  it("stores the path for the user and returns no error", async () => {
    const { client, calls } = setup()
    expect(await saveAvatarPath(client, "user-1", "user-1/new.png", NOW)).toBeNull()
    expect(calls[0]).toMatchObject({
      payload: { avatar_url: "user-1/new.png", updated_at: "2026-10-21T10:00:00.000Z" },
      filters: [{ op: "eq", column: "id", value: "user-1" }],
    })
  })

  it("returns the database error", async () => {
    const failure = { message: "denied" }
    const { client } = setup({ "update profiles": { error: failure } })
    expect(await saveAvatarPath(client, "user-1", "user-1/new.png")).toBe(failure)
  })
})

describe("savePreferences", () => {
  it("keeps the other preferences and replaces the travel styles and diets", async () => {
    const { client, calls } = setup()
    await savePreferences(client, "user-1", { theme: "dark", travelStyles: ["old"] }, ["nature"], ["vegan"], NOW)

    expect(calls[0].payload).toEqual({
      preferences: { theme: "dark", travelStyles: ["nature"] },
      dietary_needs: ["vegan"],
      updated_at: "2026-10-21T10:00:00.000Z",
    })
  })

  it("starts from empty preferences", async () => {
    const { client, calls } = setup()
    await savePreferences(client, "user-1", null, ["nature"], [], NOW)
    expect(calls[0].payload).toMatchObject({ preferences: { travelStyles: ["nature"] }, dietary_needs: [] })
  })

  it("throws when the update fails", async () => {
    const failure = { message: "denied" }
    const { client } = setup({ "update profiles": { error: failure } })
    await expect(savePreferences(client, "user-1", null, [], [])).rejects.toBe(failure)
  })
})

describe("deleteAccount", () => {
  it("removes the avatar files, then the account, then the local session", async () => {
    const { client, calls } = setup({ "list avatars": { data: [{ name: "a.png" }, { name: "b.png" }] } })
    await deleteAccount(client, "user-1")

    expect(steps(calls)).toEqual(["list avatars", "remove avatars", "rpc delete_my_account", "signOut auth"])
    expect(calls[0].payload).toBe("user-1")
    expect(calls[1].payload).toEqual(["user-1/a.png", "user-1/b.png"])
    expect(calls[3].payload).toEqual({ scope: "local" })
  })

  it("skips the file removal when there are no avatar files", async () => {
    const { client, calls } = setup({ "list avatars": { data: [] } })
    await deleteAccount(client, "user-1")
    expect(steps(calls)).toEqual(["list avatars", "rpc delete_my_account", "signOut auth"])
  })

  it("keeps the session when the account could not be deleted", async () => {
    const failure = { message: "rpc failed" }
    const { client, calls } = setup({ "rpc delete_my_account": { error: failure } })

    await expect(deleteAccount(client, "user-1")).rejects.toBe(failure)
    expect(steps(calls)).not.toContain("signOut auth")
  })
})

const sessionUser = (metadata: Record<string, unknown> = {}) => ({ id: "user-1", user_metadata: metadata }) as unknown as User

const stored = { id: "user-1", full_name: "Ayu", username: "ayu", avatar_url: null, website: null, updated_at: null }

describe("loadProfile", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns the stored profile of the user without creating one", async () => {
    const { client, calls } = setup({ "select profiles": { data: stored } })

    expect(await loadProfile(client, sessionUser())).toEqual(stored)
    expect(steps(calls)).toEqual(["select profiles"])
    expect(calls[0].filters).toEqual([{ op: "eq", column: "id", value: "user-1" }])
  })

  it("creates the profile from the sign-in metadata when none exists", async () => {
    const created = { ...stored, username: null }
    const { client, calls } = setup({ "insert profiles": { data: created } })

    const profile = await loadProfile(client, sessionUser({ full_name: "Ayu", avatar_url: "https://example.com/a.png" }))

    expect(profile).toEqual(created)
    expect(steps(calls)).toEqual(["select profiles", "insert profiles"])
    expect(calls[1].payload).toEqual({ id: "user-1", full_name: "Ayu", avatar_url: "https://example.com/a.png" })
  })

  it("stores null for metadata that is missing or empty", async () => {
    const { client, calls } = setup({ "insert profiles": { data: stored } })
    await loadProfile(client, sessionUser({ full_name: "" }))
    expect(calls[1].payload).toEqual({ id: "user-1", full_name: null, avatar_url: null })
  })

  it("falls back to the metadata and does not create anything when the lookup fails", async () => {
    const { client, calls } = setup({ "select profiles": { error: { message: "timeout" } } })

    const profile = await loadProfile(client, sessionUser({ full_name: "Ayu" }))

    expect(profile).toEqual({ id: "user-1", full_name: "Ayu", avatar_url: null, username: null, website: null, updated_at: null })
    expect(steps(calls)).toEqual(["select profiles"])
    expect(console.error).toHaveBeenCalledWith("Profile fetch error:", "timeout")
  })

  it("falls back to the metadata when the profile cannot be created", async () => {
    const { client } = setup({ "insert profiles": { error: { message: "denied" } } })

    const profile = await loadProfile(client, sessionUser({ full_name: "Ayu" }))

    expect(profile).toMatchObject({ id: "user-1", full_name: "Ayu", username: null })
    expect(console.error).toHaveBeenCalledWith("Failed to create profile:", "denied")
  })
})

describe("saveTripDefaults", () => {
  const defaults = { homeLat: -6.2, homeLng: 106.8, travelStyles: ["nature"], dietaryNeeds: ["vegan"] }

  it("stores the home location, the travel styles and the dietary needs of the user", async () => {
    const { client, calls } = setup()

    await saveTripDefaults(client, "user-1", defaults)

    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({
      table: "profiles",
      action: "update",
      payload: { home_lat: -6.2, home_lng: 106.8, preferences: { travelStyles: ["nature"] }, dietary_needs: ["vegan"] },
      filters: [{ op: "eq", column: "id", value: "user-1" }],
    })
  })

  it("throws the database error", async () => {
    const failure = { message: "denied" }
    const { client } = setup({ "update profiles": { error: failure } })
    await expect(saveTripDefaults(client, "user-1", defaults)).rejects.toBe(failure)
  })
})

