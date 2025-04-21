"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { formatDistanceToNow } from "date-fns"

export type DashboardData = {
  stats: {
    activeTrips: number
    totalTrips: number
    carbonSaved: number
    carbonProgress: number
    budgetLeft: number
    budgetProgress: number
  }
  recentItineraries: Array<{
    id: string
    name: string
    destination: string
    dates: string
    status: string
    lastUpdated: string
    image_url?: string
  }>
  analytics: {
    carbonData: Array<{
      name: string
      carbon: number
    }>
    budgetData: Array<{
      name: string
      value: number
    }>
    ecoScore: number
    ecoRating: string
    ecoMessage: string
    destinationData: Array<{
      name: string
      impact: number
    }>
  }
  upcomingActivities: Array<{
    id: string
    title: string
    date: string
    time: string
    type: string
    itineraryId: string
  }>
  travelCompanions: Array<{
    id: string
    name: string
    initials: string
    avatar?: string
    tripName: string
  }>
}

export async function fetchDashboardData(
  userId: string | undefined,
): Promise<{ data: DashboardData | null; error: Error | null }> {
  try {
    if (!userId) {
      return { data: null, error: new Error("User ID is required") }
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

    const { data: itineraries, error: itinerariesError } = await supabaseAdmin
      .from("itineraries")
      .select(`
        id,
        name,
        description,
        status,
        destination_name,
        destination_lat,
        destination_lng,
        date_from,
        date_to,
        travel_type,
        travel_styles,
        dietary_needs,
        budget,
        carbon_metrics,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (itinerariesError) {
      throw itinerariesError
    }

    const activeTrips =
      itineraries?.filter((itn) => itn.status === "confirmed" || itn.status === "planning").length || 0

    // Calculate total carbon saved
    const totalCarbonSaved = itineraries?.reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0) || 0

    // Calculate total budget left
    const totalBudgetLeft =
      itineraries?.reduce((total, itn) => {
        if (itn.status === "confirmed" || itn.status === "planning") {
          return total + ((itn.budget?.total || 0) - (itn.budget?.spent || 0))
        }
        return total
      }, 0) || 0

    // Format recent itineraries
    const recentItineraries =
      itineraries?.slice(0, 4).map((itn) => ({
        id: itn.id,
        name: itn.name,
        destination: itn.destination_name,
        dates: `${new Date(itn.date_from).toLocaleDateString()} - ${new Date(itn.date_to).toLocaleDateString()}`,
        status: itn.status,
        lastUpdated: formatDistanceToNow(new Date(itn.updated_at || itn.created_at), { addSuffix: true }),
        image_url: `/places/${itn.destination_name.toLowerCase().replace(/\s+/g, "-")}.png`,
      })) || []

    // Fetch upcoming activities
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    // First get the days for the next week
    const { data: days, error: daysError } = await supabaseAdmin
      .from("itinerary_days")
      .select(`
        id,
        itinerary_id,
        date
      `)
      .gte("date", now.toISOString().split("T")[0])
      .lte("date", nextWeek.toISOString().split("T")[0])
      .order("date", { ascending: true })

    if (daysError) {
      throw daysError
    }

    // Then get activities for those days
    let upcomingActivities: any[] = []

    if (days && days.length > 0) {
      const dayIds = days.map((day) => day.id)

      const { data: activities, error: activitiesError } = await supabaseAdmin
        .from("itinerary_activities")
        .select(`
          id,
          day_id,
          title,
          start_time,
          type,
          status
        `)
        .in("day_id", dayIds)
        .eq("status", "planned")
        .order("start_time", { ascending: true })

      if (activitiesError) {
        throw activitiesError
      }

      // Map activities to include date from parent day
      if (activities) {
        upcomingActivities = activities
          .map((activity) => {
            const parentDay = days.find((day) => day.id === activity.day_id)
            return {
              id: activity.id,
              title: activity.title,
              date: new Date(parentDay?.date || "").toLocaleDateString(),
              time: activity.start_time,
              type: activity.type,
              itineraryId: parentDay?.itinerary_id,
            }
          })
          .slice(0, 10) // Limit to 10 activities
      }
    }

    // Generate analytics data based on itineraries
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    const carbonData = months.slice(currentMonth - 5, currentMonth + 1).map((month, index) => {
      // Generate realistic carbon data based on itineraries
      const monthIndex = (currentMonth - 5 + index + 12) % 12
      const monthItineraries = itineraries?.filter((itn) => {
        const date = new Date(itn.created_at)
        return date.getMonth() === monthIndex
      })

      const carbonValue =
        monthItineraries?.reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0) ||
        Math.floor(Math.random() * 200) + 50 // Fallback to random data

      return {
        name: month,
        carbon: carbonValue,
      }
    })

    // Calculate budget allocation from itineraries
    const budgetData = [
      {
        name: "Accommodation",
        value:
          itineraries?.reduce(
            (total, itn) => total + ((itn.budget?.accommodation || 0) / (itn.budget?.total || 1)) * 100,
            0,
          ) / (itineraries?.length || 1) || 40,
      },
      {
        name: "Transportation",
        value:
          itineraries?.reduce(
            (total, itn) => total + ((itn.budget?.transportation || 0) / (itn.budget?.total || 1)) * 100,
            0,
          ) / (itineraries?.length || 1) || 25,
      },
      {
        name: "Food",
        value:
          itineraries?.reduce((total, itn) => total + ((itn.budget?.food || 0) / (itn.budget?.total || 1)) * 100, 0) /
            (itineraries?.length || 1) || 20,
      },
      {
        name: "Activities",
        value:
          itineraries?.reduce(
            (total, itn) => total + ((itn.budget?.activities || 0) / (itn.budget?.total || 1)) * 100,
            0,
          ) / (itineraries?.length || 1) || 15,
      },
    ]

    // Calculate eco score based on carbon savings
    const ecoScore = Math.min(100, Math.round(totalCarbonSaved / (itineraries?.length || 1) / 10))
    let ecoRating = "No data"
    let ecoMessage = ""

    if (ecoScore >= 80) {
      ecoRating = "Excellent!"
      ecoMessage = "You're in the top 15% of eco-conscious travelers"
    } else if (ecoScore >= 60) {
      ecoRating = "Very Good"
      ecoMessage = "You're making a significant positive impact"
    } else if (ecoScore >= 40) {
      ecoRating = "Good"
      ecoMessage = "You're on the right track to greener travel"
    } else if (ecoScore > 0) {
      ecoRating = "Getting Started"
      ecoMessage = "Keep improving your eco-friendly travel choices"
    }

    // Generate destination impact data
    const destinationData = Array.from(new Set(itineraries?.map((itn) => itn.destination_name) || []))
      .slice(0, 4)
      .map((destination) => {
        const destinationItineraries = itineraries?.filter((itn) => itn.destination_name === destination)
        const impact =
          destinationItineraries?.reduce((total, itn) => total + (itn.carbon_metrics?.saved || 0), 0) ||
          Math.floor(Math.random() * 30) + 50

        return {
          name: destination,
          impact,
        }
      })

    // If we don't have enough destinations, add some placeholder data
    if (destinationData.length < 2) {
      destinationData.push(
        { name: "Bali", impact: 65 },
        { name: "Costa Rica", impact: 85 },
        { name: "Norway", impact: 72 },
        { name: "Japan", impact: 58 },
      )
    }

    // Generate travel companions data
    const travelCompanions =
      itineraries
        ?.filter((itn) => itn.status === "confirmed" || itn.status === "planning")
        .slice(0, 3)
        .map((itn, index) => ({
          id: `companion-${index}`,
          name: ["John Doe", "Alice Ryder", "Tom Kim"][index],
          initials: ["JD", "AR", "TK"][index],
          tripName: itn.name,
        })) || []

    return {
      data: {
        stats: {
          activeTrips,
          totalTrips: itineraries?.length || 0,
          carbonSaved: totalCarbonSaved,
          carbonProgress: Math.min(100, totalCarbonSaved / 10),
          budgetLeft: totalBudgetLeft,
          budgetProgress: Math.min(
            100,
            (totalBudgetLeft / (itineraries?.reduce((total, itn) => total + (itn.budget?.total || 0), 0) || 1)) * 100,
          ),
        },
        recentItineraries,
        analytics: {
          carbonData,
          budgetData,
          ecoScore,
          ecoRating,
          ecoMessage,
          destinationData,
        },
        upcomingActivities,
        travelCompanions,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("An unknown error occurred"),
    }
  }
}
