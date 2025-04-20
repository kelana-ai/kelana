"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Compass, Leaf } from "lucide-react"
import { useState } from "react"
import type { ActivityRow } from "./itinerary-client"

interface ActivityCardProps {
  activity: ActivityRow
  index: number
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const timeDisplay = activity.end_time ? `${activity.start_time} - ${activity.end_time}` : activity.start_time

  const ecoTag = activity.eco_tags && activity.eco_tags.length > 0 ? activity.eco_tags[0] : "Eco-Friendly"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        className="overflow-visible border transition-all duration-300 hover:shadow-md cursor-pointer my-4 py-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-0 overflow-visible">
          <div className="p-4 flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{timeDisplay}</p>
                </div>
                <Badge variant="outline" className="mt-1 w-fit sm:mt-0 bg-primary/5">
                  <Leaf className="mr-1 h-3 w-3 text-primary" />
                  {ecoTag}
                </Badge>
              </div>

              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : "2.5rem" }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </motion.div>

              {activity.description.length > 100 && (
                <button
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
