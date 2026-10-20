import { z } from "zod"

import { countTripDays, toDateKey } from "@/lib/itinerary"
import { MAX_BUDGET, MAX_TRIP_DAYS, MIN_BUDGET } from "@/lib/trip-options"

// react-hook-form drops errors that only exist on nested paths (e.g. "destination.name") when a parent field is
// triggered, so object-valued fields report their errors at the field itself via refine/custom.
type DateRange = { from: Date; to: Date }

const isDateRange = (value: unknown): value is DateRange => {
  const v = value as Partial<DateRange> | null | undefined
  return v?.from instanceof Date && v?.to instanceof Date
}

export const formSchema = z.object({
  tripName: z.string().trim().min(2, { message: "Trip name must be at least 2 characters." }).max(100, {
    message: "Trip name must be at most 100 characters.",
  }),
  destination: z
    .object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .refine((d) => d.name.trim().length >= 2 && !(d.lat === 0 && d.lng === 0), {
      message: "Please search for a destination or click the map to select one.",
    }),
  homeLocation: z
    .object({
      name: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  dateRange: z
    .custom<DateRange>(isDateRange, { message: "Select both a start and an end date." })
    .refine((r) => countTripDays(toDateKey(r.from), toDateKey(r.to)) >= 1, {
      message: "End date must not be before the start date.",
    })
    .refine((r) => countTripDays(toDateKey(r.from), toDateKey(r.to)) <= MAX_TRIP_DAYS, {
      message: `Trips can be at most ${MAX_TRIP_DAYS} days long.`,
    }),
  travelType: z.enum(["solo", "couple", "friends", "family"]),
  travelStyles: z.array(z.string()).min(1, {
    message: "Select at least one travel style.",
  }),
  dietaryNeeds: z.array(z.string()),
  budget: z.number().min(MIN_BUDGET).max(MAX_BUDGET),
})

export type FormValues = z.infer<typeof formSchema>
