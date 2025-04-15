"use client"

import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currentAvatarPath, setCurrentAvatarPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const downloadImage = useCallback(
    async (path: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.storage.from("avatars").download(path)
        if (error) throw error
        return URL.createObjectURL(data)
      } catch (err) {
        console.error("Error downloading image:", err)
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
        if (error) {
          console.error("Error fetching profile:", error)
          return null
        }
        return data as Profile
      } catch (err) {
        console.error("Error in fetchProfile:", err)
        return null
      }
    },
    [supabase]
  )

  const updateUserState = useCallback(
    async (sessionUser: User) => {
      setUser(sessionUser)
      const profileData = await fetchProfile(sessionUser.id)
      if (!profileData) {
        setProfile(null)
        setAvatarUrl(null)
        setCurrentAvatarPath(null)
        return
      }

      setProfile(profileData)
      const { avatar_url } = profileData

      if (!avatar_url) {
        setAvatarUrl(null)
        setCurrentAvatarPath(null)
        return
      }

      if (avatar_url.startsWith("http")) {
        setAvatarUrl(avatar_url)
        setCurrentAvatarPath(avatar_url)
      } else {
        if (avatar_url !== currentAvatarPath) {
          if (avatarUrl && avatarUrl.startsWith("blob:")) {
            URL.revokeObjectURL(avatarUrl)
          }
          const newUrl = await downloadImage(avatar_url)
          setAvatarUrl(newUrl)
          setCurrentAvatarPath(avatar_url)
        }
      }
    },
    [avatarUrl, currentAvatarPath, fetchProfile, downloadImage]
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      await updateUserState(user)
    }
  }, [user, updateUserState])

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          await updateUserState(session.user)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          await updateUserState(session.user)
        }
        else if (event === "TOKEN_REFRESHED") {
          return
        }
        else {
          setUser(null)
          setProfile(null)
          if (avatarUrl && avatarUrl.startsWith("blob:")) {
            URL.revokeObjectURL(avatarUrl)
          }
          setAvatarUrl(null)
          setCurrentAvatarPath(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [supabase, updateUserState])

  const value = { user, profile, avatarUrl, isLoading, refreshProfile }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
