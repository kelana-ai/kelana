import { motion } from "framer-motion"

import { staggerChildren } from "@/lib/motion"
import type { DashboardData } from "@/lib/dashboard"
import { EcoTipCard } from "./eco-tip-card"
import { RecentItineraries } from "./recent-itineraries"
import { StatCards } from "./stat-cards"

const container = staggerChildren(0.1)

interface OverviewTabProps {
  data: DashboardData | null
  isLoading: boolean
  fact: string
}

export function OverviewTab({ data, isLoading, fact }: OverviewTabProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" exit="hidden" className="space-y-6">
      <StatCards stats={data?.stats} isLoading={isLoading} />
      <RecentItineraries itineraries={data?.recentItineraries} isLoading={isLoading} />
      <EcoTipCard fact={fact} isLoading={isLoading} />
    </motion.div>
  )
}
