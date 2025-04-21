"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUser } from "@/contexts/user-context"
import { format, parseISO } from "date-fns"
import { Compass, Download, Heart, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ActivityCard } from "./activity-card"
import { BudgetCard } from "./budget-card"
import { CarbonImpactCard } from "./carbon-impact-card"
import { ItineraryHeader } from "./itinerary-header"
import ItineraryMap from "./itinerary-map"
import { LocalPartnersCard } from "./local-partners-card"

export interface ActivityRow {
  id: string
  activity_index: number
  start_time: string
  end_time: string | null
  title: string
  description: string
  type: string
  status: string
  location_name: string | null
  location_lat: number | null
  location_lng: number | null
  address: string | null
  cost: number
  currency: string
  eco_tags: string[]
}

export interface DayRow {
  id: string
  day_index: number
  date: string
  itinerary_activities: ActivityRow[]
}

export interface ItineraryRow {
  id: string
  name: string
  description: string
  status: string
  destination_name: string
  destination_lat: number
  destination_lng: number
  date_from: string
  date_to: string
  travel_type: string
  travel_styles: string[]
  dietary_needs: string[]
  budget: {
    total: number
    spent: number
    remaining: number
  }
  carbon_metrics: {
    saved: number
    total: number
    percentage: number
  }
  itinerary_days: DayRow[]
}

export default function ItineraryClient({
  itinerary: itn,
}: {
  itinerary: ItineraryRow
}) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const from = parseISO(itn.date_from)
  const to = parseISO(itn.date_to)
  const dateRange = `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`

  const days = itn.itinerary_days
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      id: `day-${d.day_index + 1}`,
      date: format(parseISO(d.date), "MMM d, yyyy"),
      activities: d.itinerary_activities.sort((a, b) => a.activity_index - b.activity_index),
    }))
  const firstDay = days[0]?.id ?? ""

  const allActivities = days.flatMap((day) =>
    day.activities.map((act) => ({
      title: act.title,
      description: act.description,
      time: act.start_time + (act.end_time ? ` - ${act.end_time}` : ""),
      eco_tag: act.eco_tags[0] || "",
      type: act.type,
      location: {
        name: act.location_name || undefined,
        lat: act.location_lat || undefined,
        lng: act.location_lng || undefined,
      },
    })),
  )

  const partners = Array.from(
    new Map<string, { name: string; address: string }>(
      itn.itinerary_days.flatMap((d) => d.itinerary_activities)
        .filter((act) => act.location_name && act.address)
        .map((act) => [
          act.location_name!,
          { name: act.location_name!, address: act.address! },
        ]),
    ).values(),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <ItineraryHeader
        name={itn.name}
        destination={itn.destination_name}
        dateRange={dateRange}
        id={itn.id}
        status={itn.status}
      />

      <div className="container mx-auto py-12 px-4 space-y-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main itinerary */}
          <main className="lg:col-span-2 space-y-8">
            <Card className="overflow-visible border shadow-md transition-all duration-300 hover:shadow-lg my-4 pt-0">
              <CardHeader className="bg-primary/5 border-b pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      Daily Itinerary
                    </CardTitle>
                    <CardDescription className="pt-2.5">
                      Your eco-conscious travel plan for {itn.destination_name}
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download itinerary</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue={firstDay} className="w-full">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
                    <TabsList className="p-1 h-auto flex overflow-x-auto w-full justify-start rounded-none">
                      {days.map((d) => (
                        <TabsTrigger
                          key={d.id}
                          value={d.id}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-4 transition-all duration-200"
                        >
                          <span className="font-medium">Day {d.id.replace("day-", "")}</span>
                          <span className="hidden sm:inline ml-2 text-xs opacity-70">{d.date}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  {days.map((d) => (
                    <TabsContent key={d.id} value={d.id} className="p-4 space-y-4 animate-in fade-in-50 duration-300">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg">{d.date}</h3>
                      </div>
                      <div className="space-y-4">
                        {d.activities.map((act, index) => (
                          <ActivityCard key={act.id} activity={act} index={index} />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg pt-0">
              <CardHeader className="bg-primary/5 border-b pt-6">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Itinerary Map
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 h-[400px]">
                <ItineraryMap
                  destination={itn.destination_name}
                  destinationCoords={[itn.destination_lat, itn.destination_lng]}
                  activities={allActivities}
                />
              </CardContent>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <BudgetCard
              budgetTotal={itn.budget.total}
              budgetSpent={itn.budget.spent}
              budgetRemaining={itn.budget.remaining}
            />

            <CarbonImpactCard carbonSaved={itn.carbon_metrics.saved} carbonPercentage={itn.carbon_metrics.percentage} />

            <LocalPartnersCard partners={partners} />

            <Card className="shadow-md transition-all duration-300 hover:shadow-lg pt-0">
              <CardHeader className="bg-primary/5 border-b pt-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-5 w-5 text-primary" />
                  Travel Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Travel Style</h4>
                    <div className="flex flex-wrap gap-2">
                      {itn.travel_styles.map((style: string) => (
                        <Badge key={style} variant="secondary">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {itn.dietary_needs && itn.dietary_needs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dietary Needs</h4>
                      <div className="flex flex-wrap gap-2">
                        {itn.dietary_needs.map((diet: string) => (
                          <Badge key={diet} variant="outline">
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
