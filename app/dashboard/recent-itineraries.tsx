import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Plus, Recycle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { riseIn } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { DashboardData } from "./actions"

type Recent = DashboardData["recentItineraries"][number]

function RecentSkeleton() {
  return (
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
  )
}

function RecentCard({ itinerary }: { itinerary: Recent }) {
  return (
    <motion.div variants={riseIn}>
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
                  src={itinerary.icon || "/places/bali.png"}
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
  )
}

function NoItineraries() {
  return (
    <motion.div variants={riseIn} className="md:col-span-2">
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No itineraries yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">Create your first itinerary to get started</p>
        <Button asChild>
          <Link href="/itinerary/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
          </Link>
        </Button>
      </Card>
    </motion.div>
  )
}

export function RecentItineraries({ itineraries, isLoading }: { itineraries?: Recent[]; isLoading: boolean }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-[150px]" />
            <Skeleton className="h-9 w-[80px]" />
          </>
        ) : (
          <>
            <motion.h2 variants={riseIn} className="text-xl font-semibold">
              Recent Itineraries
            </motion.h2>
            <motion.div variants={riseIn}>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/itinerary">View all</Link>
              </Button>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <RecentSkeleton />
        ) : itineraries && itineraries.length > 0 ? (
          itineraries.map((itinerary) => <RecentCard key={itinerary.id} itinerary={itinerary} />)
        ) : (
          <NoItineraries />
        )}
      </div>
    </div>
  )
}
