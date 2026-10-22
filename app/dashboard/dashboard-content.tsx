import { AnimatePresence } from "framer-motion"

import type { DashboardData } from "@/lib/dashboard"
import { AnalyticsTab } from "./analytics-tab"
import { OverviewTab } from "./overview-tab"
import { UpcomingTab } from "./upcoming-tab"

interface DashboardContentProps {
  activeTab: string
  isLoading: boolean
  data: DashboardData | null
  fact: string
}

export function DashboardContent({ activeTab, isLoading, data, fact }: DashboardContentProps) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === "overview" && (
        <OverviewTab key={`overview-${isLoading ? "loading" : "loaded"}`} data={data} isLoading={isLoading} fact={fact} />
      )}
      {!isLoading && activeTab === "analytics" && <AnalyticsTab key="analytics" analytics={data?.analytics} />}
      {!isLoading && activeTab === "upcoming" && <UpcomingTab key="upcoming" activities={data?.upcomingActivities} />}
    </AnimatePresence>
  )
}
