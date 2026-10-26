"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void },
  ): string
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

let loading: Promise<TurnstileApi> | undefined

function loadTurnstile() {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)
    const script = document.createElement("script")
    script.src = SCRIPT
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not load")))
    script.onerror = () => {
      loading = undefined
      reject(new Error("Turnstile could not be loaded"))
    }
    document.head.appendChild(script)
  })
  return loading
}

function Widget({ onToken }: { onToken: (token: string | null) => void }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widget: string | undefined
    let removed = false
    loadTurnstile()
      .then((api) => {
        if (removed || !container.current || !siteKey) return
        widget = api.render(container.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        })
      })
      .catch(() => onToken(null))
    return () => {
      removed = true
      if (widget) window.turnstile?.remove(widget)
    }
  }, [onToken])

  return <div ref={container} data-testid="turnstile" />
}

export interface Captcha {
  enabled: boolean
  token: string | null
  widget: ReactNode
  reset: () => void
}

export function useCaptcha(): Captcha {
  const [token, setToken] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const reset = useCallback(() => {
    setToken(null)
    setAttempt((count) => count + 1)
  }, [])

  const enabled = Boolean(siteKey)
  return { enabled, token, widget: enabled ? <Widget key={attempt} onToken={setToken} /> : null, reset }
}
