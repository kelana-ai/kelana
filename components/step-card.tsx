"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StepCardProps {
  number: number
  title: string
  description: string
  isEven?: boolean
}

export function StepCard({ number, title, description, isEven = false }: StepCardProps) {
  return (
    <div className={cn("relative flex", isEven ? "md:justify-end" : "md:justify-start")}>
      <div className="relative max-w-md">
        {/* Step number circle that connects to the timeline */}
        <div className="absolute left-1/2 top-0 z-10 -ml-6 -mt-6 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground md:left-auto md:ml-0 md:translate-x-0">
          {number}
        </div>

        {/* Card content */}
        <motion.div whileHover={{ scale: 1.03 }} className="relative z-0 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-2 mt-4 text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </motion.div>
      </div>
    </div>
  )
}
