import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, describe, expect, it, vi } from "vitest"

import { fakeSupabase, steps, type Reply } from "@/test/fake-supabase"
import { avatarPublicUrl, replaceAvatar } from "./avatars"

const file = new File(["x"], "me.png", { type: "image/png" })

function setup(replies: Record<string, Reply> = {}) {
  return fakeSupabase({ reply: (call) => replies[`${call.action} ${call.table}`] ?? {} })
}

describe("replaceAvatar", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("uploads under the folder of the user, saves the path and removes the previous file", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111")
    const { client, calls } = setup()
    const save = vi.fn(async () => true)

    await replaceAvatar(client, "user-1", file, "user-1/old.png", save)

    expect(steps(calls)).toEqual(["upload avatars", "remove avatars"])
    expect(calls[0].payload).toMatchObject({ path: "user-1/11111111-1111-4111-8111-111111111111.png" })
    expect(save).toHaveBeenCalledWith("user-1/11111111-1111-4111-8111-111111111111.png")
    expect(calls[1].payload).toEqual(["user-1/old.png"])
  })

  it.each([null, "https://example.com/me.png", "user-2/old.png"])("keeps the previous avatar %j", async (previous) => {
    const { client, calls } = setup()
    await replaceAvatar(client, "user-1", file, previous, async () => true)
    expect(steps(calls)).toEqual(["upload avatars"])
  })

  it("removes the new file when the profile could not be updated, and keeps the old one", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("22222222-2222-4222-8222-222222222222")
    const { client, calls } = setup()

    await replaceAvatar(client, "user-1", file, "user-1/old.png", async () => false)

    expect(steps(calls)).toEqual(["upload avatars", "remove avatars"])
    expect(calls[1].payload).toEqual(["user-1/22222222-2222-4222-8222-222222222222.png"])
  })

  it("throws and saves nothing when the upload fails", async () => {
    const failure = { message: "too large" }
    const { client, calls } = setup({ "upload avatars": { error: failure } })
    const save = vi.fn(async () => true)

    await expect(replaceAvatar(client, "user-1", file, "user-1/old.png", save)).rejects.toBe(failure)
    expect(save).not.toHaveBeenCalled()
    expect(steps(calls)).toEqual(["upload avatars"])
  })
})

describe("avatarPublicUrl", () => {
  it("asks the avatars bucket for the public address of a file", () => {
    const client = {
      storage: { from: (bucket: string) => ({ getPublicUrl: (path: string) => ({ data: { publicUrl: `https://files.test/${bucket}/${path}` } }) }) },
    } as unknown as SupabaseClient

    expect(avatarPublicUrl(client, "user-1/a.png")).toBe("https://files.test/avatars/user-1/a.png")
  })
})
