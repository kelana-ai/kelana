import { motion } from "framer-motion"
import { BarChart3, Globe, Leaf, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { riseIn } from "@/lib/motion"
import type { DashboardData } from "@/lib/dashboard"

type Analytics = DashboardData["analytics"]

const COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6"]
const tooltipStyle = { backgroundColor: "var(--background)", border: "1px solid var(--border)" }
const chartMargin = { top: 5, right: 20, left: 0, bottom: 5 }

export function CarbonTrendCard({ data }: { data?: Analytics["carbonData"] }) {
  return (
    <motion.div variants={riseIn}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Carbon Savings Trend
          </CardTitle>
          <CardDescription>Your positive environmental impact over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data || []} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="carbon" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function BudgetAllocationCard({ data }: { data?: Analytics["budgetData"] }) {
  return (
    <motion.div variants={riseIn}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Budget Allocation
          </CardTitle>
          <CardDescription>How your travel budget is distributed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {(data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function EcoScoreCard({ analytics }: { analytics?: Analytics }) {
  return (
    <motion.div variants={riseIn}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Leaf className="h-5 w-5 text-green-500" />
            Eco Impact Score
          </CardTitle>
          <CardDescription>Based on the estimated CO₂ savings of your itineraries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle className="stroke-muted" cx="50" cy="50" r="45" fill="none" strokeWidth="10" strokeLinecap="round" />
                <circle
                  className="stroke-green-500"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - (analytics?.ecoScore || 0) / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-green-500">{analytics?.ecoScore || 0}</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="font-medium">{analytics?.ecoRating || "No data"}</p>
              <p className="text-sm text-muted-foreground">{analytics?.ecoMessage || ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function DestinationImpactCard({ data }: { data?: Analytics["destinationData"] }) {
  return (
    <motion.div variants={riseIn}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-blue-500" />
            Destination Impact
          </CardTitle>
          <CardDescription>Environmental impact by destination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="impact" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
