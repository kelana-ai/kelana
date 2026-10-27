import { afterEach, describe, expect, it, vi } from "vitest"

const captureException = vi.fn()
vi.mock("@sentry/nextjs", () => ({ captureException }))

describe("reportClientError", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    captureException.mockClear()
  })

  it("does nothing without a DSN", async () => {
    const { reportClientError } = await import("./report-client")
    reportClientError(new Error("boom"), "page")
    await vi.dynamicImportSettled()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(captureException).not.toHaveBeenCalled()
  })

  it("loads the SDK and sends the error when a DSN was set at build time", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@o1.ingest.sentry.io/2")
    const { reportClientError } = await import("./report-client")
    const failure = new Error("boom")
    reportClientError(failure, "global")

    await vi.waitFor(() => expect(captureException).toHaveBeenCalledExactlyOnceWith(failure, { tags: { context: "global" } }))
  })
})
