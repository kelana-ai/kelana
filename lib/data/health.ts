export type DatabaseHealth = { ok: true; latencyMs: number } | { ok: false }

interface PingOptions {
  url: string | undefined
  key: string | undefined
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export async function pingDatabase({ url, key, fetchImpl = fetch, timeoutMs = 4000 }: PingOptions): Promise<DatabaseHealth> {
  if (!url || !key) return { ok: false }

  const started = performance.now()
  try {
    const response = await fetchImpl(`${url}/rest/v1/rpc/ping`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok || (await response.json()) !== 1) return { ok: false }
    return { ok: true, latencyMs: Math.round(performance.now() - started) }
  } catch {
    return { ok: false }
  }
}
