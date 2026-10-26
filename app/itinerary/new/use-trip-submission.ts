"use client"

import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import type { Captcha } from "@/components/turnstile"
import { submitItinerary } from "./actions"
import type { FormValues } from "./schema"
import { submission } from "./wizard"

export function useTripSubmission(form: UseFormReturn<FormValues>, user: User | null, captcha: Captcha) {
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

    submitItinerary(submission(data, captcha.token ?? undefined))
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
      .finally(captcha.reset)
  }

  const cancel = () => {
    setError(null)
    setShowLoading(false)
  }

  const retry = () => {
    if (captcha.enabled) return cancel()
    setError(null)
    submit(form.getValues())
  }

  return { isSubmitting, showLoading, error, submit, retry, cancel }
}
