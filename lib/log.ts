export interface GenerationLog {
  action: "create" | "refine"
  outcome: "success" | "rejected" | "error"
  durationMs: number
  modelMs?: number
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  days?: number
}

export function logGeneration(entry: GenerationLog) {
  console.log(JSON.stringify({ event: "itinerary.generation", ...entry }))
}
