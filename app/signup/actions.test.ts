import { beforeEach, describe, expect, it, vi } from "vitest"

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }))
vi.mock("@/utils/supabase/client", () => ({ createClient: () => ({ auth: { signUp } }) }))

import { signup } from "./actions"

const form = (email: string, password: string) => {
  const data = new FormData()
  data.set("email", email)
  data.set("password", password)
  data.set("confirmPassword", password)
  return data
}

describe("signup", () => {
  beforeEach(() => {
    signUp.mockReset()
  })

  it("creates the account with the email and the password and nothing else from the form", async () => {
    signUp.mockResolvedValue({ error: null })

    expect(await signup(form("ayu@example.com", "secret-1234"))).toEqual({ success: true })
    expect(signUp).toHaveBeenCalledExactlyOnceWith({ email: "ayu@example.com", password: "secret-1234", options: { captchaToken: undefined } })
  })

  it("passes on the security check token", async () => {
    signUp.mockResolvedValue({ error: null })
    await signup(form("ayu@example.com", "secret-1234"), "token-abc")

    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ options: { captchaToken: "token-abc" } }))
  })

  it("returns the error of the sign up", async () => {
    const error = { message: "User already registered" }
    signUp.mockResolvedValue({ error })

    expect(await signup(form("ayu@example.com", "secret-1234"))).toEqual({ error })
  })
})
