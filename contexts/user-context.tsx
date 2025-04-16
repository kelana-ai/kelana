"use client"

import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  website: string | null
  updated_at: string | null
}

type UserContextType = {
  user: User | null
  profile: Profile | null
  avatarUrl: string | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  avatarUrl: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const currentAvatarPathRef = useRef<string | null>(null)
  const initialized = useRef(false)

  const downloadImage = useCallback(
    async (path: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.storage.from("avatars").download(path)
        if (error) throw error
        return URL.createObjectURL(data)
      } catch (err) {
        console.error("Image download error:", err)
        return null
      }
    },
    [supabase]
  )

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()
          
        return error ? null : data as Profile
      } catch (err) {
        console.error("Profile fetch error:", err)
        return null
      }
    },
    [supabase]
  )

  const updateUserState = useCallback(
    async (sessionUser: User) => {
      try {
        setIsLoading(true)
        setUser(sessionUser)

        const profileData = await fetchProfile(sessionUser.id)
        setProfile(profileData)

        const avatarPath = profileData?.avatar_url
        if (!avatarPath) {
          currentAvatarPathRef.current = null
          setAvatarUrl(null)
          return
        }

        if (avatarPath === currentAvatarPathRef.current) return

        if (avatarPath.startsWith("http")) {
          setAvatarUrl(avatarPath)
          currentAvatarPathRef.current = avatarPath
        } else {
          const newUrl = await downloadImage(avatarPath)
          setAvatarUrl(newUrl)
          currentAvatarPathRef.current = avatarPath
        }
      } catch (err) {
        console.error("User state update error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [downloadImage, fetchProfile]
  )

  const refreshProfile = useCallback(async () => {
    user && await updateUserState(user)
  }, [user, updateUserState])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await updateUserState(session.user)
      } else {
        setIsLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          await updateUserState(session.user)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setAvatarUrl(null)
          currentAvatarPathRef.current = null
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
      if (avatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [supabase, updateUserState, avatarUrl])

  const value = useMemo(() => ({
    user,
    profile,
    avatarUrl,
    isLoading,
    refreshProfile,
  }), [user, profile, avatarUrl, isLoading, refreshProfile])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
