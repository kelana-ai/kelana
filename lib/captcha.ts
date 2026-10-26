const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export const CAPTCHA_MESSAGE = "Please complete the security check and try again."

interface VerifyOptions {
  token: string | undefined
  secret: string | undefined
  ip?: string
  fetchImpl?: typeof fetch
  url?: string
}

export async function verifyCaptcha({ token, secret, ip, fetchImpl = fetch, url = process.env.TURNSTILE_VERIFY_URL ?? VERIFY_URL }: VerifyOptions) {
  if (!secret) return true
  if (!token) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set("remoteip", ip)
    const response = await fetchImpl(url, { method: "POST", body, signal: AbortSignal.timeout(5000) })
    if (!response.ok) return false
    return ((await response.json()) as { success?: boolean }).success === true
  } catch {
    return false
  }
}
