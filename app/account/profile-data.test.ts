import { describe, expect, it } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { deleteAccount, saveAvatarPath, savePreferences, saveProfile } from "./profile-data"

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
