import { MapPin } from "lucide-react"
import type { ComponentProps } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ItineraryMap from "./itinerary-map"

export function MapCard(props: ComponentProps<typeof ItineraryMap>) {
  return (
    <Card className="overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Itinerary Map
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 h-[400px]">
        <ItineraryMap {...props} />
      </CardContent>
    </Card>
  )
}
