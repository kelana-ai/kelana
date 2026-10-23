import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "./route"

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("answers 200 when the database answers", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("1", { status: 200 })))
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(await response.json()).toMatchObject({ status: "ok", database: "ok" })
  })

  it("answers 503 when the database does not", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })))
    const response = await GET()

    expect(response.status).toBe(503)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(await response.json()).toEqual({ status: "error", database: "unreachable" })
  })

  it("answers 503 when the project is not configured", async () => {
    vi.unstubAllEnvs()
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "")
    vi.stubGlobal("fetch", vi.fn())
    const response = await GET()

    expect(response.status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })
})
