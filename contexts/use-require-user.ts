"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useUser } from "./user-context"

export function useRequireUser() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])
}
