const OFF = new Set(["off", "false", "0", "no"])

export type Feature = "generation"

export function isEnabled(feature: Feature, env: Record<string, string | undefined> = process.env) {
  const value = env[`FEATURE_${feature.toUpperCase()}`]
  return !value || !OFF.has(value.trim().toLowerCase())
}

export const PAUSED_MESSAGE = "Itinerary generation is switched off for now. Please try again later."
