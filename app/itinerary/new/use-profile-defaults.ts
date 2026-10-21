"use client"

import { useEffect, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"

import type { Profile } from "@/contexts/user-context"
import type { FormValues } from "./schema"
import { profileDefaults } from "./wizard"

export function useProfileDefaults(form: UseFormReturn<FormValues>, profile: Profile | null) {
  const applied = useRef(false)

  useEffect(() => {
    if (!profile || applied.current) return
    applied.current = true
    const defaults = profileDefaults(profile, form.formState.dirtyFields)
    if (defaults.homeLocation) form.setValue("homeLocation", defaults.homeLocation)
    if (defaults.travelStyles) form.setValue("travelStyles", defaults.travelStyles)
    if (defaults.dietaryNeeds) form.setValue("dietaryNeeds", defaults.dietaryNeeds)
  }, [profile, form])
}
