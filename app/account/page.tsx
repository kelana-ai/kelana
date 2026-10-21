"use client"

import { useUser } from "@/contexts/user-context"
import { AccountContent } from "./account-content"
import { AccountSkeleton } from "./account-skeleton"

export default function Account() {
  const { user, profile, isLoading } = useUser()

  if (isLoading) return <AccountSkeleton />
  if (!user || !profile) return null

  return <AccountContent key={profile.id} user={user} profile={profile} />
}
