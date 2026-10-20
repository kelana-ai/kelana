"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import { useEffect, useState } from "react"

interface CarbonImpactCardProps {
  carbonSaved: number
  carbonPercentage: number
}

export function CarbonImpactCard({ carbonSaved, carbonPercentage }: CarbonImpactCardProps) {
  const [percentage, setPercentage] = useState(0)
  const radius = 40
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage(carbonPercentage)
    }, 500)

    return () => clearTimeout(timer)
  }, [carbonPercentage])

  const dashOffset = circumference * (1 - percentage / 100)

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg overflow-visible my-4 pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Leaf className="h-5 w-5 text-primary" />
          Carbon Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-visible">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-muted" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="10"
                className="stroke-primary"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <motion.span
                className="text-2xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(percentage)}%
              </motion.span>
              <span className="text-xs text-muted-foreground">Reduced</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-primary">{carbonSaved} kg</span> CO₂ saved vs. conventional travel
          </p>
          <p className="text-center text-xs text-muted-foreground">
            AI-generated estimate based on the chosen transport, stays and activities. It is not an audited carbon calculation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
