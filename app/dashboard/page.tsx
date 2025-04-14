"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/user-context"
import { Calendar, Clock, Leaf, MapPin, Plus, Recycle, Wallet } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, profile, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const stats = {
    activeTrips: 2,
    carbonSaved: "1,240kg",
    budgetLeft: "$2,450",
  }

  const recentItineraries = [
    {
      id: "1",
      name: "Bali Eco Retreat",
      destination: "Bali, Indonesia",
      dates: "Aug 15-28, 2023",
      status: "Active",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      name: "Costa Rica Adventure",
      destination: "Costa Rica",
      dates: "Nov 10-20, 2023",
      status: "Planning",
      lastUpdated: "5 days ago",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Traveler"}
          </h1>
          <p className="text-muted-foreground">Continue planning your eco-conscious adventures</p>
        </div>
        <Button asChild>
          <Link href="/itinerary/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">Upcoming travel plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carbonSaved}</div>
            <p className="text-xs text-muted-foreground">Compared to conventional travel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Left</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.budgetLeft}</div>
            <p className="text-xs text-muted-foreground">For your upcoming trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Itineraries */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Itineraries</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-itineraries">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recentItineraries.map((itinerary) => (
            <Card key={itinerary.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{itinerary.name}</CardTitle>
                  <Badge variant={itinerary.status === "Active" ? "default" : "secondary"}>{itinerary.status}</Badge>
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
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/itinerary/${itinerary.id}`}>View Details</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/ai-refine/${itinerary.id}`}>
                    <Recycle className="mr-2 h-4 w-4" /> Refine
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Sustainability Tips */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> Eco Tip of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Consider using trains for shorter journeys within Europe. A train from London to Paris generates 90% less
            emissions than flying the same route.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0 text-primary" asChild>
            <Link href="/sustainability-tips">More eco-travel tips</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
