import type { ReactNode } from "react"

// Generating an itinerary runs inside a server action and can take minutes; 300 seconds is the longest a function
// may run on Vercel's free plan.
export const maxDuration = 300

export default function NewItineraryLayout({ children }: { children: ReactNode }) {
  return children
}
