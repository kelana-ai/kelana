import { afterEach, describe, expect, it, vi } from "vitest"

import { CAPTCHA_MESSAGE, verifyCaptcha } from "./captcha"

const answer = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe("verifyCaptcha", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("lets everything through when no secret is configured, without calling out", async () => {
    const fetchImpl = answer({ success: false })

    expect(await verifyCaptcha({ token: undefined, secret: undefined, fetchImpl })).toBe(true)
    expect(await verifyCaptcha({ token: "abc", secret: "", fetchImpl })).toBe(true)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("refuses a missing token without calling out once a secret is configured", async () => {
    const fetchImpl = answer({ success: true })

    expect(await verifyCaptcha({ token: undefined, secret: "s", fetchImpl })).toBe(false)
    expect(await verifyCaptcha({ token: "", secret: "s", fetchImpl })).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("posts the secret, the token and the address of the visitor to Cloudflare", async () => {
    const fetchImpl = answer({ success: true })

    expect(await verifyCaptcha({ token: "good", secret: "s3cret", ip: "203.0.113.7", fetchImpl })).toBe(true)

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify")
    expect(init.method).toBe("POST")
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({ secret: "s3cret", response: "good", remoteip: "203.0.113.7" })
  })

  it("leaves the address out when there is none", async () => {
    const fetchImpl = answer({ success: true })
    await verifyCaptcha({ token: "good", secret: "s", fetchImpl })

    expect(Object.keys(Object.fromEntries((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams))).toEqual(["secret", "response"])
  })

  it.each([
    ["a rejected token", answer({ success: false, "error-codes": ["invalid-input-response"] })],
    ["an answer without a verdict", answer({})],
    ["a verdict that is not true", answer({ success: "yes" })],
    ["an error status", answer({ success: true }, 500)],
    ["an answer that is not JSON", vi.fn(async () => new Response("<html>", { status: 200 }))],
    ["a network error", vi.fn(async () => Promise.reject(new TypeError("fetch failed")))],
  ])("refuses %s", async (_label, fetchImpl) => {
    expect(await verifyCaptcha({ token: "t", secret: "s", fetchImpl })).toBe(false)
  })

  it("can use another verification address, which the browser tests need", async () => {
    vi.stubEnv("TURNSTILE_VERIFY_URL", "http://127.0.0.1:4010/turnstile/siteverify")
    const fetchImpl = answer({ success: true })
    await verifyCaptcha({ token: "t", secret: "s", fetchImpl, url: process.env.TURNSTILE_VERIFY_URL })

    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe("http://127.0.0.1:4010/turnstile/siteverify")
  })
})

describe("CAPTCHA_MESSAGE", () => {
  it("asks the person to try again", () => {
    expect(CAPTCHA_MESSAGE).toMatch(/security check/)
  })
})
