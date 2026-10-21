"use client"

import { useEffect, useState } from "react"
import type { FieldErrors, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { steps } from "./constants"
import type { FormValues } from "./schema"
import { firstInvalidStep } from "./wizard"

export function useWizardSteps(form: UseFormReturn<FormValues>) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  async function next() {
    if (currentStep === 0) {
      const tripNameValid = await form.trigger("tripName")
      const destinationValid = await form.trigger("destination")
      const dateRangeValid = await form.trigger("dateRange")
      if (!tripNameValid || !destinationValid || !dateRangeValid) return
    } else if (currentStep === 2) {
      if (!(await form.trigger("travelType"))) return
    } else if (currentStep === 3) {
      if (!(await form.trigger("travelStyles"))) return
    }
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep((s) => s + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 0)
    }
  }

  function back() {
    if (currentStep > 0) {
      setTimeout(() => {
        setCurrentStep((s) => s - 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 0)
    }
  }

  function showInvalid(errors: FieldErrors<FormValues>) {
    setCurrentStep(firstInvalidStep(Object.keys(errors)))
    toast.error("Please complete the highlighted fields before generating your itinerary.")
  }

  return { currentStep, next, back, showInvalid }
}
