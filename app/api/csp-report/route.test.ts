import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "./route"

const post = (body: string) => POST(new Request("https://site.test/api/csp-report", { method: "POST", body }))

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("logs one line for each violation and answers 204", async () => {
    const body = JSON.stringify([
      { type: "csp-violation", body: { documentURL: "https://site.test/about", effectiveDirective: "img-src", blockedURL: "https://cdn.test/a.png" } },
      { type: "csp-violation", body: { documentURL: "https://site.test/", effectiveDirective: "script-src", blockedURL: "inline" } },
    ])
    const response = await post(body)

    expect(response.status).toBe(204)
    expect(vi.mocked(console.log).mock.calls.map(([line]) => JSON.parse(line as string))).toEqual([
      { event: "csp.violation", directive: "img-src", blocked: "https://cdn.test", page: "/about" },
      { event: "csp.violation", directive: "script-src", blocked: "inline", page: "/" },
    ])
  })

  it("answers 204 and logs nothing for a report that holds no violation", async () => {
    expect((await post(JSON.stringify([{ type: "deprecation", body: {} }]))).status).toBe(204)
    expect(console.log).not.toHaveBeenCalled()
  })

  it("answers 400 for a body that is not JSON", async () => {
    expect((await post("not json")).status).toBe(400)
    expect(console.log).not.toHaveBeenCalled()
  })

  it("answers 413 for a body over 10 KB", async () => {
    expect((await post(" ".repeat(10_001))).status).toBe(413)
    expect(console.log).not.toHaveBeenCalled()
  })
})
