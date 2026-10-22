"use client"

import { useMemo } from "react"

import { effectiveStatus, formatDateKey, itineraryToText } from "@/lib/itinerary"
import { downloadFileName, mapActivitiesOf, placesOf, prepareDays, type ItineraryRow } from "@/lib/itinerary-view"
import { BudgetCard } from "./budget-card"
import { CarbonImpactCard } from "./carbon-impact-card"
import { DailyItineraryCard } from "./daily-itinerary-card"
import { ItineraryHeader } from "./itinerary-header"
import { PlacesCard } from "./local-partners-card"
import { MapCard } from "./map-card"
import { PreferencesCard } from "./preferences-card"
import { saveTextFile } from "./save-text-file"

export default function ItineraryClient({ itinerary: itn }: { itinerary: ItineraryRow }) {
  const dateRange = `${formatDateKey(itn.date_from, "MMM d")} - ${formatDateKey(itn.date_to)}`

  const days = useMemo(() => prepareDays(itn.itinerary_days), [itn.itinerary_days])
  const mapActivities = useMemo(() => mapActivitiesOf(days), [days])
  const places = useMemo(() => placesOf(days), [days])

  function downloadItinerary() {
    const text = itineraryToText({
      name: itn.name,
      destination_name: itn.destination_name,
      date_from: itn.date_from,
      date_to: itn.date_to,
      days: days.map((d) => ({
        date: d.rawDate,
        activities: d.activities.map((a) => ({
          start_time: a.start_time,
          end_time: a.end_time,
          title: a.title,
          description: a.description,
          address: a.address,
          cost: a.cost,
        })),
      })),
    })
    saveTextFile(downloadFileName(itn.name), text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <ItineraryHeader
        name={itn.name}
        destination={itn.destination_name}
        dateRange={dateRange}
        id={itn.id}
        status={effectiveStatus(itn.status, itn.date_to)}
      />

      <div className="container mx-auto py-12 px-4 space-y-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <main className="lg:col-span-2 space-y-8">
            <DailyItineraryCard destination={itn.destination_name} days={days} onDownload={downloadItinerary} />
            <MapCard destination={itn.destination_name} lat={itn.destination_lat} lng={itn.destination_lng} activities={mapActivities} />
          </main>

          <aside className="space-y-6">
            <BudgetCard
              budgetTotal={itn.budget.total ?? 0}
              budgetSpent={itn.budget.spent ?? 0}
              budgetRemaining={itn.budget.remaining ?? 0}
            />
            <CarbonImpactCard carbonSaved={itn.carbon_metrics.saved ?? 0} carbonPercentage={itn.carbon_metrics.percentage ?? 0} />
            <PlacesCard places={places} />
            <PreferencesCard styles={itn.travel_styles} dietaryNeeds={itn.dietary_needs} />
          </aside>
        </div>
      </div>
    </div>
  )
}
