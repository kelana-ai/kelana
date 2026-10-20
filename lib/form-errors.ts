/** Object-typed form fields (e.g. destination, dateRange) report errors on nested keys, so find the first message. */
export function firstErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return ""
  const e = error as { message?: unknown } & Record<string, unknown>
  if (typeof e.message === "string" && e.message) return e.message
  for (const key of Object.keys(e)) {
    if (key === "ref" || key === "type" || key === "types") continue
    const nested = firstErrorMessage(e[key])
    if (nested) return nested
  }
  return ""
}
