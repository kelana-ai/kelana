"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteItinerary } from "./actions"

export function useItineraryDeletion(onDeleted: (id: string) => void) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const request = (id: string) => {
    setPendingId(id)
    setOpen(true)
  }

  const confirm = async () => {
    if (!pendingId) return

    try {
      setIsDeleting(true)

      const result = await deleteItinerary(pendingId)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete itinerary")
      }

      onDeleted(pendingId)
      toast.success("Itinerary deleted successfully")

      router.refresh()
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      toast.error("Failed to delete itinerary")
    } finally {
      setIsDeleting(false)
      setPendingId(null)
      setOpen(false)
    }
  }

  return { open, setOpen, isDeleting, request, confirm }
}
