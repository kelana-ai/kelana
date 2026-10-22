import { Compass, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PreparedDay } from "@/lib/itinerary-view"
import { ActivityCard } from "./activity-card"

interface DailyItineraryCardProps {
  destination: string
  days: PreparedDay[]
  onDownload: () => void
}

export function DailyItineraryCard({ destination, days, onDownload }: DailyItineraryCardProps) {
  return (
    <Card className="overflow-visible border shadow-md transition-all duration-300 hover:shadow-lg my-4 pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Daily Itinerary
            </CardTitle>
            <CardDescription className="pt-2.5">Your plan for {destination}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDownload} aria-label="Download itinerary">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={days[0]?.id ?? ""} className="w-full">
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
  )
}
