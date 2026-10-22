import type { User } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { loadProfile } from "./load-profile"

const sessionUser = (metadata: Record<string, unknown> = {}) => ({ id: "user-1", user_metadata: metadata }) as unknown as User

const stored = { id: "user-1", full_name: "Ayu", username: "ayu", avatar_url: null, website: null, updated_at: null }

function setup(replies: Record<string, Reply>) {
  return fakeSupabase({ reply: (call) => replies[`${call.action} ${call.table}`] ?? {} })
}

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
