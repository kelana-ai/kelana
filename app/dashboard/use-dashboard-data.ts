"use client"

import { useEffect, useState } from "react"
import { fetchDashboardData, type DashboardData } from "./actions"

export function useDashboardData(userId: string | undefined) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const result = await fetchDashboardData()

        if (result.error) {
          throw result.error
        }

        setData(result.data)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError(err instanceof Error ? err : new Error("Failed to load dashboard data"))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  return { data, isLoading, error }
}
