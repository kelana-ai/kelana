import { z } from "zod"

export const formSchema = z.object({
  tripName: z.string().min(2, {
    message: "Trip name must be at least 2 characters.",
  }),
  destination: z.object({
    name: z.string().min(2, { message: "Destination is required." }),
    lat: z.number(),
    lng: z.number(),
  }),
  homeLocation: z
    .object({
      name: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  travelType: z.enum(["solo", "couple", "friends", "family"]),
  travelStyles: z.array(z.string()).min(1, {
    message: "Select at least one travel style.",
  }),
  dietaryNeeds: z.array(z.string()),
  budget: z.number().min(100).max(10000),
})

export type FormValues = z.infer<typeof formSchema>
