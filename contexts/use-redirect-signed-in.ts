"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useUser } from "./user-context"

export function useRedirectSignedIn(destination = "/dashboard") {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(destination)
    }
  }, [user, isLoading, router, destination])
}
