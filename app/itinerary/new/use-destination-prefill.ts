"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"

import type { FormValues } from "./schema"
import { suggestedTripName } from "./wizard"

export function useDestinationPrefill(form: UseFormReturn<FormValues>) {
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("destination")?.trim()
    if (!wanted) return
    const controller = new AbortController()
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(wanted)}&limit=1`, {
      headers: { "Accept-Language": "en" },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((results: { display_name: string; lat: string; lon: string }[]) => {
        const hit = results[0]
        if (!hit || form.getValues("destination").name) return
        form.setValue("destination", { name: hit.display_name, lat: Number.parseFloat(hit.lat), lng: Number.parseFloat(hit.lon) })
        if (!form.getValues("tripName")) form.setValue("tripName", suggestedTripName(wanted))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [form])
}
