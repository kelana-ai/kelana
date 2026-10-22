"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRequireUser } from "@/contexts/use-require-user"
import { useUser } from "@/contexts/user-context"
import { displayName } from "@/lib/display-name"
import { ecoFacts } from "@/lib/eco-facts"
import { DashboardContent } from "./dashboard-content"
import { DashboardHeading } from "./dashboard-heading"
import { useDashboardData } from "./use-dashboard-data"
import { WelcomeBanner } from "./welcome-banner"

export default function DashboardPage() {
  const { user, profile, isLoading: isUserLoading } = useUser()
  const [activeTab, setActiveTab] = useState("overview")
  const [randomFact] = useState(() => ecoFacts[Math.floor(Math.random() * ecoFacts.length)])

  const { data, isLoading, error } = useDashboardData(user?.id)

  useRequireUser()

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data. Please try again later.")
    }
  }, [error])

  const isPageLoading = isUserLoading || isLoading

  return (
    <div className="container max-w-7xl py-6 lg:py-8">
      <WelcomeBanner hidden={isPageLoading} />
      <DashboardHeading isLoading={isPageLoading} name={displayName(profile, user?.email, "Traveler")} />

      {!isPageLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      <DashboardContent activeTab={activeTab} isLoading={isPageLoading} data={data} fact={randomFact} />
    </div>
  )
}
