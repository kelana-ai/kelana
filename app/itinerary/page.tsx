"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/contexts/user-context"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchItineraries } from "./actions"
import { ItineraryList } from "./itinerary-list"

export default function ItineraryPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [formattedItineraries, setFormattedItineraries] = useState<
    Array<{
      id: string
      name: string
      description: string | null
      destination: string
      start_date: string
      end_date: string
      status: "draft" | "planning" | "confirmed" | "completed" | "cancelled"
      carbon_saved: number
      carbon_percentage: number
      budget_total: number
      travel_type: string
      created_at: string
      updated_at: string
      user_id: string
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user) {
      setLoading(true)
      fetchItineraries(user).then((response) => {
        const itineraries = response.itineraries || []
        const formatted = itineraries.map((itinerary) => ({
          id: itinerary.id,
          name: itinerary.name,
          description: itinerary.description,
          destination: itinerary.destination_name,
          start_date: itinerary.date_from,
          end_date: itinerary.date_to,
          status: itinerary.status as "draft" | "planning" | "confirmed" | "completed" | "cancelled",
          carbon_saved: itinerary.carbon_metrics?.saved || 0,
          carbon_percentage: itinerary.carbon_metrics?.percentage || 0,
          budget_total: itinerary.budget?.total || 0,
          travel_type: itinerary.travel_type,
          created_at: itinerary.created_at,
          updated_at: itinerary.updated_at || itinerary.created_at,
          user_id: itinerary.user_id,
        }))

        setFormattedItineraries(formatted)
        setLoading(false)
      })
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Skeleton className="mb-6 h-10 w-full max-w-md" />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <ItineraryList initialItineraries={formattedItineraries} loading={loading} />
    </motion.div>
  )
}
