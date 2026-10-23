import { afterEach, describe, expect, it, vi } from "vitest"

import { pingDatabase } from "./health"

const options = { url: "https://project.supabase.co", key: "publishable-key" }

const answer = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe("pingDatabase", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("calls the ping function with the publishable key and reports how long it took", async () => {
    const fetchImpl = answer(1)
    const result = await pingDatabase({ ...options, fetchImpl })

    expect(result).toMatchObject({ ok: true })
    expect(result.ok && result.latencyMs).toBeGreaterThanOrEqual(0)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://project.supabase.co/rest/v1/rpc/ping")
    expect(init).toMatchObject({ method: "POST", body: "{}", cache: "no-store", headers: { apikey: "publishable-key" } })
  })

  it.each([
    ["an error status", answer({ message: "down" }, 503)],
    ["an answer other than 1", answer(2)],
    ["an answer that is not JSON", vi.fn(async () => new Response("<html>", { status: 200 }))],
    ["a network error", vi.fn(async () => Promise.reject(new TypeError("fetch failed")))],
  ])("is not ok for %s", async (_label, fetchImpl) => {
    expect(await pingDatabase({ ...options, fetchImpl })).toEqual({ ok: false })
  })

  it.each([
    ["no url", { url: undefined, key: "k" }],
    ["no key", { url: "https://project.supabase.co", key: undefined }],
  ])("is not ok with %s and does not call out", async (_label, missing) => {
    const fetchImpl = answer(1)
    expect(await pingDatabase({ ...missing, fetchImpl })).toEqual({ ok: false })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("gives up when the database does not answer in time", async () => {
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))))
    expect(await pingDatabase({ ...options, fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 20 })).toEqual({ ok: false })
  })
})
