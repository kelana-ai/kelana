import * as Sentry from "@sentry/nextjs"
import { afterEach, describe, expect, it, vi } from "vitest"

import { reportError } from "./report"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

describe("reportError", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("sends the error to Sentry with the place it came from", () => {
    const failure = new Error("denied")
    reportError(failure, "create")

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(failure, { tags: { context: "create" } })
  })
})
