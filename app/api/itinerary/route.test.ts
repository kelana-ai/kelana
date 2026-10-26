import { beforeEach, describe, expect, it, vi } from "vitest"

const { submit, runModel, verifyCaptcha, forwardedFor } = vi.hoisted(() => ({
  submit: vi.fn(),
  runModel: vi.fn(),
  verifyCaptcha: vi.fn(),
  forwardedFor: { value: null as string | null },
}))

vi.mock("@/app/itinerary/new/submit", () => ({ submit }))
vi.mock("@/app/itinerary/generation", () => ({ runModel }))
vi.mock("@/lib/captcha", () => ({ verifyCaptcha }))
vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("next/headers", () => ({ headers: async () => new Headers(forwardedFor.value ? { "x-forwarded-for": forwardedFor.value } : {}) }))

import { POST } from "./route"

const post = (body: string, type: string | null = "application/json") =>
  POST(new Request("https://site.test/api/itinerary", { method: "POST", body, headers: type ? { "content-type": type } : {} }))

describe("POST /api/itinerary", () => {
  beforeEach(() => {
    submit.mockReset()
    runModel.mockReset()
    verifyCaptcha.mockReset()
    forwardedFor.value = null
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")
  })

  it("streams the answer of the create action for a JSON body", async () => {
    submit.mockResolvedValue({ success: true, itineraryId: "itn-1" })
    const trip = { tripName: "Ubud trip" }
    const response = await post(JSON.stringify(trip))

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"type":"done","itineraryId":"itn-1"}\n')
    expect(submit.mock.calls[0][1]).toEqual(trip)
  })

  it.each([
    ["a body that is not JSON", () => post("not json"), 400],
    ["a body over 20 KB", () => post(JSON.stringify({ pad: "x".repeat(20_001) })), 413],
    ["a content type other than JSON", () => post("{}", "text/plain"), 415],
    ["no content type", () => post("{}", null), 415],
  ])("refuses %s with %i and does not start the action", async (_label, request, status) => {
    expect((await request()).status).toBe(status)
    expect(submit).not.toHaveBeenCalled()
  })

  it("gives the model call a way to report partial results", async () => {
    submit.mockImplementation(async (deps: { generate: (prompt: string) => Promise<unknown> }) => {
      runModel.mockResolvedValue({ itinerary: {}, usage: {} })
      await deps.generate("the prompt")
      return { success: true, itineraryId: "itn-1" }
    })
    await (await post("{}")).text()

    expect(runModel).toHaveBeenCalledWith("the prompt", expect.any(Function))
  })

  it("checks the security token with the secret and the first address of the visitor", async () => {
    forwardedFor.value = "203.0.113.7, 10.0.0.1"
    verifyCaptcha.mockResolvedValue(true)
    submit.mockImplementation(async (deps: { verifyCaptcha: (token: string | undefined) => Promise<boolean> }) => {
      await deps.verifyCaptcha("good-token")
      return { success: true, itineraryId: "itn-1" }
    })
    await (await post("{}")).text()

    expect(verifyCaptcha).toHaveBeenCalledExactlyOnceWith({ token: "good-token", secret: "secret", ip: "203.0.113.7" })
  })

  it("works without an address", async () => {
    verifyCaptcha.mockResolvedValue(true)
    submit.mockImplementation(async (deps: { verifyCaptcha: (token: string | undefined) => Promise<boolean> }) => {
      await deps.verifyCaptcha(undefined)
      return { success: false, error: "nope" }
    })
    await (await post("{}")).text()

    expect(verifyCaptcha).toHaveBeenCalledWith({ token: undefined, secret: "secret", ip: undefined })
  })
})
