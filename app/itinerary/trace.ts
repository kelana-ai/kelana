import type { GenerationLog } from "@/lib/log"
import { logGeneration } from "@/lib/log"
import type { GeneratedItinerary } from "@/lib/itinerary"

export interface ModelUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export interface ModelRun {
  itinerary: GeneratedItinerary
  usage: ModelUsage
}

export type Trace = Partial<Omit<GenerationLog, "action" | "durationMs">>

export async function runTraced(trace: Trace, generate: (prompt: string) => Promise<ModelRun>, prompt: string) {
  const started = Date.now()
  try {
    const run = await generate(prompt)
    Object.assign(trace, run.usage)
    return run.itinerary
  } finally {
    trace.modelMs = Date.now() - started
  }
}

export async function withTrace<R extends { success: boolean }>(
  action: GenerationLog["action"],
  run: (trace: Trace) => Promise<R>,
): Promise<R> {
  const started = Date.now()
  const trace: Trace = {}
  let result: R | undefined
  try {
    result = await run(trace)
    return result
  } catch (error) {
    trace.outcome ??= "error"
    throw error
  } finally {
    const outcome = trace.outcome ?? (result?.success ? "success" : "rejected")
    logGeneration({ ...trace, action, outcome, durationMs: Date.now() - started })
  }
}
