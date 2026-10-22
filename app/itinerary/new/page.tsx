"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import { useUser } from "@/contexts/user-context"
import { ErrorRecovery } from "./error-recovery"
import { LoadingExperience } from "./loading-experience"
import { formSchema, type FormValues } from "./schema"
import { StepIndicator } from "./step-indicator"
import { useDestinationPrefill } from "./use-destination-prefill"
import { useProfileDefaults } from "./use-profile-defaults"
import { useTripSubmission } from "./use-trip-submission"
import { useWizardSteps } from "./use-wizard-steps"
import { WizardCard } from "./wizard-card"
import { defaultTripDates } from "./wizard"

export default function NewItineraryPage() {
  const { user, profile, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripName: "",
      destination: { name: "", lat: 0, lng: 0 },
      homeLocation: undefined,
      dateRange: defaultTripDates(),
      travelType: "solo",
      travelStyles: [],
      dietaryNeeds: [],
      budget: 2500,
    },
  })

  useProfileDefaults(form, profile)
  useDestinationPrefill(form)
  const wizard = useWizardSteps(form)
  const trip = useTripSubmission(form, user)

  if (trip.showLoading) {
    return trip.error ? (
      <ErrorRecovery error={trip.error} onRetry={trip.retry} onCancel={trip.cancel} />
    ) : (
      <LoadingExperience destination={form.getValues().destination.name} tripName={form.getValues().tripName} />
    )
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Plan a trip</h1>
          <p className="mt-2 text-muted-foreground">Answer a few questions and Kelana will write the itinerary.</p>
        </div>

        <StepIndicator currentStep={wizard.currentStep} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(trip.submit, wizard.showInvalid)}>
            <WizardCard
              form={form}
              currentStep={wizard.currentStep}
              isSubmitting={trip.isSubmitting}
              onBack={wizard.back}
              onNext={wizard.next}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
