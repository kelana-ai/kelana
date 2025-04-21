"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  BarChart3,
  Calendar,
  Clock,
  Globe,
  Leaf,
  MapPin,
  Plus,
  Recycle,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"

import Image from "next/image"
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
import { toast } from "sonner"
import { useDashboardData } from "./use-dashboard-data"

export default function DashboardPage() {
  const { user, profile, isLoading: isUserLoading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [showWelcome, setShowWelcome] = useState(true)

  // Fetch dashboard data using the custom hook
  const { data, isLoading, error, refetch } = useDashboardData(user?.id)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data. Please try again later.")
    }
  }, [error, toast])

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const sustainabilityTips = [
    "Reduce plastic usage by opting for reusable water bottles and bags.",
    "Eat more locally sourced, plant-based foods to lower your carbon footprint.",
    "Support eco-friendly accommodations and travel providers to decrease your environmental impact.",
    "Plan your trips ahead and combine travel dates to reduce overall travel emissions.",
    "Offset your carbon emissions through verified climate projects when booking flights or long trips.",
    "Travel light—lighter luggage means lower fuel consumption, especially on flights.",
    "Respect local wildlife and ecosystems by sticking to marked trails and avoiding disturbing animals.",
    "Use public transportation, walk, or rent bikes instead of hiring a car wherever possible.",
    "Avoid single-use toiletries—bring your own reusable containers filled with greener products.",
    "Choose digital tickets, maps, and guides to cut down on paper waste.",
    "Buy souvenirs from local artisans to support the community and reduce the carbon footprint of imported goods.",
    "Say no to daily hotel linen changes to save water and energy during your stay.",
    "Use reef-safe sunscreen when swimming in oceans to protect marine life and coral reefs.",
    "Minimize food waste by ordering only what you can finish and trying local dishes in moderation.",
  ]

  const randomTip = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * sustainabilityTips.length)
    return sustainabilityTips[randomIndex]
  }, [sustainabilityTips])

  const COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6"]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transportation":
        return <Globe className="h-4 w-4 text-blue-500" />
      case "accommodation":
        return <MapPin className="h-4 w-4 text-green-500" />
      case "activity":
        return <Sparkles className="h-4 w-4 text-amber-500" />
      default:
        return <Calendar className="h-4 w-4 text-primary" />
    }
  }

  const isPageLoading = isUserLoading || isLoading

  return (
    <div className="container max-w-7xl py-6 lg:py-8">
      <AnimatePresence>
        {showWelcome && !isPageLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 rounded-lg bg-primary/10 p-4 text-center"
          >
            <p className="text-sm font-medium text-primary">Welcome back to your eco-conscious travel dashboard! 🌿</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with theme toggle */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {isPageLoading ? (
          <div>
            <Skeleton className="mb-2 h-10 w-[250px]" />
            <Skeleton className="h-5 w-[180px]" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="text-primary">
                {profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Traveler"}
              </span>
            </h1>
            <p className="text-muted-foreground">Continue planning your eco-conscious adventures</p>
          </motion.div>
        )}

        <div className="flex items-center gap-3">
          {isPageLoading ? (
            <Skeleton className="h-10 w-[180px]" />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button asChild>
                <Link href="/itinerary/new">
                  <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs for different dashboard views */}
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

      {/* Overview Tab Content */}
      {(isPageLoading || activeTab === "overview") && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            {isPageLoading ? (
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
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-500">{data?.stats.activeTrips || 0}</div>
                      <p className="text-xs text-muted-foreground">Upcoming travel plans</p>
                      <div className="mt-3 h-1 w-full rounded-full bg-muted">
                        <div
                          className="h-1 rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min(100, ((data?.stats.activeTrips || 0) / (data?.stats.totalTrips || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                        <Leaf className="h-4 w-4 text-green-500 dark:text-green-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {data?.stats.carbonSaved ? `${data.stats.carbonSaved}kg` : "0kg"}
                      </div>
                      <p className="text-xs text-muted-foreground">Compared to conventional travel</p>
                      <div className="mt-3">
                        <Progress value={data?.stats.carbonProgress || 0} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Budget Left</CardTitle>
                      <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                        <Wallet className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-500">
                        ${data?.stats.budgetLeft?.toLocaleString() || "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">For your upcoming trips</p>
                      <div className="mt-3">
                        <Progress value={data?.stats.budgetProgress || 0} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          {/* Recent Itineraries */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              {isPageLoading ? (
                <>
                  <Skeleton className="h-7 w-[150px]" />
                  <Skeleton className="h-9 w-[80px]" />
                </>
              ) : (
                <>
                  <motion.h2 variants={itemVariants} className="text-xl font-semibold">
                    Recent Itineraries
                  </motion.h2>
                  <motion.div variants={itemVariants}>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/itinerary">View all</Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {isPageLoading ? (
                <>
                  {[1, 2].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader>
                        <div className="mb-2 flex justify-between">
                          <Skeleton className="h-6 w-[140px]" />
                          <Skeleton className="h-5 w-[70px] rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-[120px]" />
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Skeleton className="mb-2 h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Skeleton className="h-9 w-[100px]" />
                        <Skeleton className="h-9 w-[100px]" />
                      </CardFooter>
                    </Card>
                  ))}
                </>
              ) : data?.recentItineraries && data.recentItineraries.length > 0 ? (
                <>
                  {data.recentItineraries.map((itinerary) => (
                    <motion.div key={itinerary.id} variants={itemVariants}>
                      <Card
                        className={cn(
                          "group overflow-hidden transition-all hover:shadow-md",
                          itinerary.status === "confirmed" ? "border-l-4 border-l-primary" : "",
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-md">
                                <Image
                                  src={itinerary.image_url || "/placeholder.svg?height=40&width=40"}
                                  alt={itinerary.destination}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                />
                              </div>
                              <CardTitle className="text-lg">{itinerary.name}</CardTitle>
                            </div>
                            <Badge
                              variant={itinerary.status === "confirmed" ? "default" : "secondary"}
                              className="transition-transform group-hover:scale-105"
                            >
                              {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {itinerary.destination}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{itinerary.dates}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Updated {itinerary.lastUpdated}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="transition-all hover:bg-primary hover:text-primary-foreground"
                          >
                            <Link href={`/itinerary/${itinerary.id}`}>View Details</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="group-hover:bg-muted/80">
                            <Link href={`/itinerary/${itinerary.id}/refine`}>
                              <Recycle className="mr-2 h-4 w-4" /> Refine
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </>
              ) : (
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">No itineraries yet</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Create your first eco-conscious travel itinerary to get started
                    </p>
                    <Button asChild>
                      <Link href="/itinerary/new">
                        <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
                      </Link>
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sustainability Tips */}
          <motion.div variants={itemVariants}>
            <Card
              className={cn(
                isPageLoading
                  ? ""
                  : "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20",
              )}
            >
              {isPageLoading ? (
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-[180px]" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-9 w-[150px]" />
                </div>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                        <Leaf className="h-4 w-4 text-primary" />
                      </div>
                      <span>Greener Travel Tip</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic text-muted-foreground">"{randomTip}"</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="px-0 text-primary" asChild>
                      <Link href="/sustainability-tips">More eco-travel tips</Link>
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics Tab Content */}
      {!isPageLoading && activeTab === "analytics" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Carbon Savings Chart */}
            <motion.div variants={itemVariants}>
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
                      <LineChart
                        data={data?.analytics?.carbonData || []}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                        <YAxis stroke="var(--muted-foreground)" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="carbon"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget Allocation Chart */}
            <motion.div variants={itemVariants}>
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
                          data={data?.analytics?.budgetData || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(data?.analytics?.budgetData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Eco Impact Score */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Eco Impact Score
                  </CardTitle>
                  <CardDescription>Your environmental impact compared to average travelers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-40 w-40 items-center justify-center">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle
                          className="stroke-muted"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <circle
                          className="stroke-green-500"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="283"
                          strokeDashoffset={283 * (1 - (data?.analytics?.ecoScore || 0) / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-green-500">{data?.analytics?.ecoScore || 0}</span>
                        <span className="text-xs text-muted-foreground">out of 100</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-medium">{data?.analytics?.ecoRating || "No data"}</p>
                      <p className="text-sm text-muted-foreground">{data?.analytics?.ecoMessage || ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Destinations Impact */}
            <motion.div variants={itemVariants}>
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
                      <BarChart
                        data={data?.analytics?.destinationData || []}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                        <YAxis stroke="var(--muted-foreground)" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                          }}
                        />
                        <Bar dataKey="impact" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Tab Content */}
      {!isPageLoading && activeTab === "upcoming" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Activities
                </CardTitle>
                <CardDescription>Your scheduled activities for the next few days</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.upcomingActivities && data.upcomingActivities.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {data.upcomingActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                              <h3 className="font-medium">{activity.title}</h3>
                              <Badge variant="outline">{activity.type}</Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{activity.date}</span>
                              <span className="text-muted-foreground/50">•</span>
                              <Clock className="h-3 w-3" />
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-muted p-3">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">No upcoming activities</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any activities scheduled for the next few days
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/itinerary">View All Itineraries</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-primary" />
                  Travel Companions
                </CardTitle>
                <CardDescription>People joining you on your upcoming trips</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.travelCompanions && data.travelCompanions.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {data.travelCompanions.map((companion) => (
                      <div key={companion.id} className="flex flex-col items-center gap-2">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={companion.avatar || `/placeholder.svg?height=64&width=64`} />
                          <AvatarFallback>{companion.initials}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium">{companion.name}</p>
                          <p className="text-xs text-muted-foreground">{companion.tripName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 rounded-full bg-muted p-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">No travel companions</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any companions for your upcoming trips
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
