import { motion } from "framer-motion"
import { Calendar, Clock, Globe, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { riseIn, staggerChildren } from "@/lib/motion"
import type { DashboardData } from "@/lib/dashboard"

type Activity = DashboardData["upcomingActivities"][number]

const container = staggerChildren(0.1)

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "transportation":
      return <Globe className="h-4 w-4 text-blue-500" />
    case "accommodation":
      return <MapPin className="h-4 w-4 text-green-500" />
    case "sightseeing":
    case "wellness":
    case "event":
      return <Sparkles className="h-4 w-4 text-amber-500" />
    default:
      return <Calendar className="h-4 w-4 text-primary" />
  }
}

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <ActivityIcon type={activity.type} />
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
  )
}

function NoUpcoming() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium">No upcoming activities</h3>
      <p className="text-sm text-muted-foreground">You don't have any activities scheduled for the next few days</p>
    </div>
  )
}

export function UpcomingTab({ activities }: { activities?: Activity[] }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" exit="hidden" className="space-y-6">
      <motion.div variants={riseIn}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>Your scheduled activities for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <NoUpcoming />
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/itinerary">View All Itineraries</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
