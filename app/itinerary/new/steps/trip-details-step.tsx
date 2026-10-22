"use client"

import { useSyncExternalStore } from "react"
import type { UseFormReturn } from "react-hook-form"

import type { FormValues } from "../schema"
import { useLocationSearch } from "../use-location-search"
import { DateRangeField, DestinationField, TripNameField } from "./trip-details-fields"

const subscribeToNothing = () => () => {}

export function TripDetailsStep({ form }: { form: UseFormReturn<FormValues> }) {
  // the prerendered HTML carries the build date, so the default dates only render after hydration
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false)
  const search = useLocationSearch((location) => {
    form.setValue("destination", location, { shouldValidate: form.formState.isSubmitted || Boolean(form.getFieldState("destination").error) })
  })

  return (
    <div className="space-y-6">
      <TripNameField form={form} />
      <DestinationField form={form} search={search} />
      <DateRangeField form={form} hydrated={hydrated} />
    </div>
  )
}
