import { beforeEach, describe, expect, it, vi } from "vitest"

const { signInWithPassword } = vi.hoisted(() => ({ signInWithPassword: vi.fn() }))
vi.mock("@/utils/supabase/client", () => ({ createClient: () => ({ auth: { signInWithPassword } }) }))

import { login } from "./actions"

const form = (email: string, password: string) => {
  const data = new FormData()
  data.set("email", email)
  data.set("password", password)
  return data
}

describe("login", () => {
  beforeEach(() => {
    signInWithPassword.mockReset()
  })

  it("signs in with the email and the password of the form", async () => {
    signInWithPassword.mockResolvedValue({ error: null })

    expect(await login(form("ayu@example.com", "secret-123"))).toEqual({ success: true })
    expect(signInWithPassword).toHaveBeenCalledExactlyOnceWith({ email: "ayu@example.com", password: "secret-123", options: { captchaToken: undefined } })
  })

  it("passes on the security check token", async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    await login(form("ayu@example.com", "secret-123"), "token-abc")

    expect(signInWithPassword).toHaveBeenCalledWith(expect.objectContaining({ options: { captchaToken: "token-abc" } }))
  })

  it("returns the error of the sign in", async () => {
    const error = { message: "Invalid login credentials" }
    signInWithPassword.mockResolvedValue({ error })

    expect(await login(form("ayu@example.com", "wrong"))).toEqual({ error })
  })
})
