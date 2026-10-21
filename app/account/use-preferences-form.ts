"use client"

import type { SupabaseClient } from "@supabase/supabase-js"
import { useState } from "react"
import { toast } from "sonner"

import type { Profile } from "@/contexts/user-context"
import { toggleItem } from "@/lib/profile"
import { savePreferences } from "./profile-data"

export function usePreferencesForm(supabase: SupabaseClient, userId: string, profile: Profile, refreshProfile: () => Promise<void>) {
  const [styles, setStyles] = useState<string[]>(profile.preferences?.travelStyles ?? [])
  const [diets, setDiets] = useState<string[]>(profile.dietary_needs ?? [])
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await savePreferences(supabase, userId, profile.preferences, styles, diets)
      await refreshProfile()
      toast.success("Preferences saved")
    } catch (error) {
      console.error("Save preferences error:", error)
      toast.error("Error saving preferences")
    } finally {
      setSaving(false)
    }
  }

  return {
    styles,
    diets,
    toggleStyle: (id: string) => setStyles(toggleItem(styles, id)),
    toggleDiet: (id: string) => setDiets(toggleItem(diets, id)),
    saving,
    save,
  }
}
