"use client"

import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { submitItinerary } from "./actions"
import type { FormValues } from "./schema"
import { submission } from "./wizard"

export function useTripSubmission(form: UseFormReturn<FormValues>, user: User | null) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  function submit(data: FormValues) {
    if (!user) {
      toast.error("You must be logged in to create an itinerary")
      return
    }

    window.scrollTo({ top: 0, behavior: "smooth" })

    setIsSubmitting(true)
    setShowLoading(true)

    submitItinerary(submission(data))
      .then((response) => {
        if (response.success) {
          toast.success("Itinerary generated successfully!")
          router.push(`/itinerary/${response.itineraryId}`)
        } else {
          setError(new Error(response.error))
          setIsSubmitting(false)
        }
      })
      .catch((failure) => {
        setError(failure instanceof Error ? failure : new Error("Failed to generate itinerary"))
        setIsSubmitting(false)
      })
  }

  const retry = () => {
    setError(null)
    submit(form.getValues())
  }

  const cancel = () => {
    setError(null)
    setShowLoading(false)
  }

  return { isSubmitting, showLoading, error, setError, submit, retry, cancel }
}
