import { motion } from "framer-motion"

import type { PlanDay } from "./stream"

export function PlanSoFar({ days }: { days: PlanDay[] }) {
  if (days.length === 0) return null

  return (
    <div className="mb-8 max-h-72 w-full max-w-md space-y-3 overflow-auto" data-testid="plan-so-far">
      <h2 className="text-sm font-medium text-muted-foreground">Your plan so far</h2>
      {days.map((day, index) => (
        <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-lg border bg-card p-3 text-sm">
          <p className="font-medium">Day {index + 1}</p>
          {day.activities.length > 0 ? (
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {day.activities.map((title, position) => (
                <li key={position}>{title}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted-foreground">Choosing the first stops...</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
