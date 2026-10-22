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

describe("wizard schema edges", () => {
  const range = (days: number) => ({ from: new Date(2026, 9, 1), to: new Date(2026, 9, days) })

  it.each([
    ["one character", "a"],
    ["spaces only", "   "],
    ["one character between spaces", "  a  "],
    ["101 characters", "t".repeat(101)],
  ])("rejects a trip name of %s", async (_label, tripName) => {
    expect((await errorsFor({ ...valid(), tripName })).tripName).toBeDefined()
  })

  it.each([
    ["two characters", "ab"],
    ["two characters between spaces", "  ab  "],
    ["100 characters", "t".repeat(100)],
  ])("accepts a trip name of %s", async (_label, tripName) => {
    expect((await errorsFor({ ...valid(), tripName })).tripName).toBeUndefined()
  })

  it.each([
    ["no name", { name: "", lat: 1, lng: 1 }],
    ["a one character name", { name: "a", lat: 1, lng: 1 }],
    ["a name of spaces", { name: "   ", lat: 1, lng: 1 }],
    ["coordinates at 0, 0", { name: "Ubud", lat: 0, lng: 0 }],
  ])("rejects a destination with %s", async (_label, destination) => {
    expect((await errorsFor({ ...valid(), destination })).destination?.message).toMatch(/destination/i)
  })

  it.each([
    ["a two character name", { name: "Ub", lat: 1, lng: 1 }],
    ["a latitude of 0", { name: "Ubud", lat: 0, lng: 1 }],
    ["a longitude of 0", { name: "Ubud", lat: 1, lng: 0 }],
  ])("accepts a destination with %s", async (_label, destination) => {
    expect((await errorsFor({ ...valid(), destination })).destination).toBeUndefined()
  })

  it.each([1, 2, 10])("accepts a trip of %i days", async (days) => {
    expect((await errorsFor({ ...valid(), dateRange: range(days) })).dateRange).toBeUndefined()
  })

  it("rejects a trip of 11 days", async () => {
    expect((await errorsFor({ ...valid(), dateRange: range(11) })).dateRange?.message).toBe("Trips can be at most 10 days long.")
  })

  it("rejects an end date one day before the start date", async () => {
    const dateRange = { from: new Date(2026, 9, 5), to: new Date(2026, 9, 4) }
    expect((await errorsFor({ ...valid(), dateRange })).dateRange?.message).toMatch(/before the start/i)
  })

  it("counts the days on the calendar, not in 24 hour steps", async () => {
    const dateRange = { from: new Date(2026, 9, 1, 23, 59), to: new Date(2026, 9, 10, 0, 1) }
    expect((await errorsFor({ ...valid(), dateRange })).dateRange).toBeUndefined()
  })

  it.each([100, 101, 9999, 10_000])("accepts a budget of %i", async (budget) => {
    expect((await errorsFor({ ...valid(), budget })).budget).toBeUndefined()
  })

  it.each([99, 0, -1, 10_001])("rejects a budget of %i", async (budget) => {
    expect((await errorsFor({ ...valid(), budget })).budget).toBeDefined()
  })

  it("rejects a budget that is not a number", async () => {
    expect((await errorsFor({ ...valid(), budget: "2500" })).budget).toBeDefined()
  })

  it("rejects a travel type it does not know", async () => {
    expect((await errorsFor({ ...valid(), travelType: "pirate" })).travelType).toBeDefined()
  })
})
