interface NameSource {
  full_name?: string | null
  username?: string | null
}

export function displayName(profile: NameSource | null | undefined, email: string | null | undefined, fallback = "") {
  return profile?.full_name || profile?.username || email?.split("@")[0] || fallback
}

export function initialOf(profile: NameSource | null | undefined, email: string | null | undefined) {
  return profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || "U"
}
