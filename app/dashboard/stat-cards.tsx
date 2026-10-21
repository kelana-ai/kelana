import { motion } from "framer-motion"
import { Calendar, Leaf, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { riseIn } from "@/lib/motion"
import type { DashboardData } from "./actions"

interface StatCardProps {
  title: string
  icon: ReactNode
  iconClassName: string
  value: ReactNode
  valueClassName: string
  caption: string
  footer: ReactNode
}

function StatCard({ title, icon, iconClassName, value, valueClassName, caption, footer }: StatCardProps) {
  return (
    <motion.div variants={riseIn}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={iconClassName}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className={valueClassName}>{value}</div>
          <p className="text-xs text-muted-foreground">{caption}</p>
          {footer}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatCardsSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-8 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export function StatCards({ stats, isLoading }: { stats?: DashboardData["stats"]; isLoading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {isLoading ? (
        <StatCardsSkeleton />
      ) : (
        <>
          <StatCard
            title="Active Trips"
            icon={<Calendar className="h-4 w-4 text-blue-500 dark:text-blue-300" />}
            iconClassName="rounded-full bg-blue-100 p-2 dark:bg-blue-900"
            value={stats?.activeTrips || 0}
            valueClassName="text-3xl font-bold text-blue-500"
            caption="Upcoming travel plans"
            footer={
              <div className="mt-3 h-1 w-full rounded-full bg-muted">
                <div
                  className="h-1 rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(100, ((stats?.activeTrips || 0) / (stats?.totalTrips || 1)) * 100)}%`,
                  }}
                />
              </div>
            }
          />
          <StatCard
            title="Carbon Saved"
            icon={<Leaf className="h-4 w-4 text-green-500 dark:text-green-300" />}
            iconClassName="rounded-full bg-green-100 p-2 dark:bg-green-900"
            value={stats?.carbonSaved ? `${stats.carbonSaved}kg` : "0kg"}
            valueClassName="text-3xl font-bold text-green-500"
            caption="Estimated vs. conventional travel"
            footer={
              <div className="mt-3">
                <Progress value={stats?.carbonProgress || 0} className="h-1" />
              </div>
            }
          />
          <StatCard
            title="Budget Left"
            icon={<Wallet className="h-4 w-4 text-amber-500 dark:text-amber-300" />}
            iconClassName="rounded-full bg-amber-100 p-2 dark:bg-amber-900"
            value={`$${stats?.budgetLeft?.toLocaleString() || "0"}`}
            valueClassName="text-3xl font-bold text-amber-500"
            caption="For your upcoming trips"
            footer={
              <div className="mt-3">
                <Progress value={stats?.budgetProgress || 0} className="h-1" />
              </div>
            }
          />
        </>
      )}
    </div>
  )
}
