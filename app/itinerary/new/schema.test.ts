import { zodResolver } from "@hookform/resolvers/zod"
import { createFormControl } from "react-hook-form"
import { describe, expect, it } from "vitest"

import { formSchema, type FormValues } from "./schema"

const valid = (): FormValues => ({
  tripName: "Bali trip",
  destination: { name: "Ubud, Bali", lat: -8.5, lng: 115.26 },
  homeLocation: undefined,
  dateRange: { from: new Date(2026, 9, 25), to: new Date(2026, 9, 27) },
  travelType: "solo",
  travelStyles: ["nature"],
  dietaryNeeds: [],
  budget: 2500,
})

async function errorsFor(values: unknown) {
  const res = await zodResolver(formSchema)(values as FormValues, undefined, { fields: {}, shouldUseNativeValidation: false })
  return res.errors as Record<string, { message?: string } | undefined>
}

// What the wizard's "Continue" button does: trigger the field through react-hook-form and read the stored error.
async function storedError(values: unknown, field: "destination" | "dateRange") {
  const { control, formControl } = createFormControl<FormValues>({
    defaultValues: values as FormValues,
    resolver: zodResolver(formSchema),
  })
  control.register(field)
  const ok = await formControl.trigger(field)
  return { ok, error: control._formState.errors[field] as { message?: string } | undefined }
}

describe("wizard schema", () => {
  it("accepts a valid trip", async () => {
    expect(await errorsFor(valid())).toEqual({})
  })

  it("keeps the destination error on the field so react-hook-form stores it", async () => {
    const { ok, error } = await storedError({ ...valid(), destination: { name: "", lat: 0, lng: 0 } }, "destination")
    expect(ok).toBe(false)
    expect(error?.message).toMatch(/destination/i)
  })

  it("keeps the date error on the field when only the start date is picked", async () => {
    const { ok, error } = await storedError({ ...valid(), dateRange: { from: new Date(2026, 9, 25), to: undefined } }, "dateRange")
    expect(ok).toBe(false)
    expect(error?.message).toMatch(/start and an end/i)
  })

  it("rejects reversed and over-long ranges with a message", async () => {
    const reversed = await errorsFor({ ...valid(), dateRange: { from: new Date(2026, 9, 27), to: new Date(2026, 9, 25) } })
    expect(reversed.dateRange?.message).toMatch(/before the start/i)
    const long = await errorsFor({ ...valid(), dateRange: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 28) } })
    expect(long.dateRange?.message).toMatch(/at most/i)
  })

  it("requires at least one travel style", async () => {
    expect((await errorsFor({ ...valid(), travelStyles: [] })).travelStyles?.message).toMatch(/at least one/i)
  })
})
