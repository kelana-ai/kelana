import { motion } from "framer-motion"

import { staggerChildren } from "@/lib/motion"
import type { DashboardData } from "./actions"
import { BudgetAllocationCard, CarbonTrendCard, DestinationImpactCard, EcoScoreCard } from "./analytics-cards"

const container = staggerChildren(0.1)

export function AnalyticsTab({ analytics }: { analytics?: DashboardData["analytics"] }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" exit="hidden" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CarbonTrendCard data={analytics?.carbonData} />
        <BudgetAllocationCard data={analytics?.budgetData} />
        <EcoScoreCard analytics={analytics} />
        <DestinationImpactCard data={analytics?.destinationData} />
      </div>
    </motion.div>
  )
}
