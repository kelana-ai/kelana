import { motion } from "framer-motion"
import { Calendar, Clock, CreditCard, Leaf, MapPin, MoreHorizontal, Trash2, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDateKey } from "@/lib/itinerary"
import type { Itinerary } from "@/lib/itinerary-filters"
import { riseIn } from "@/lib/motion"

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>
    case "planning":
      return <Badge variant="secondary">Planning</Badge>
    case "confirmed":
      return <Badge variant="default">Confirmed</Badge>
    case "completed":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/20 dark:text-green-400 dark:hover:bg-green-800/30"
        >
          Completed
        </Badge>
      )
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function travelTypeIcon(type: string) {
  switch (type) {
    case "solo":
      return "👤"
    case "couple":
      return "👫"
    case "friends":
      return "👥"
    case "family":
      return "👨‍👩‍👧"
    default:
      return "🧳"
  }
}

function ItineraryActions({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-all duration-200 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/itinerary/${id}`} className="cursor-pointer">
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/itinerary/${id}/refine`} className="cursor-pointer">
            Refine with AI
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(id)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Itinerary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ItineraryCard({ itinerary, onDelete }: { itinerary: Itinerary; onDelete: (id: string) => void }) {
  return (
    <motion.div variants={riseIn} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold group-hover:text-primary transition-colors duration-200">{itinerary.name}</h3>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <StatusBadge status={itinerary.status} />
              </motion.div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70" />
                <span>{itinerary.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/70" />
                <span>
                  {formatDateKey(itinerary.start_date)} - {formatDateKey(itinerary.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary/70" />
                <span>
                  <span className="mr-1">{travelTypeIcon(itinerary.travel_type)}</span>
                  {itinerary.travel_type.charAt(0).toUpperCase() + itinerary.travel_type.slice(1)} Travel
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary/70" />
                <span>${itinerary.budget_total} Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                <span>Updated {new Date(itinerary.updated_at).toLocaleDateString()}</span>
              </div>
              {itinerary.carbon_saved > 0 && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Leaf className="h-4 w-4" />
                  <span>
                    {itinerary.carbon_saved}kg CO₂ saved ({itinerary.carbon_percentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>
          <CardFooter className="border-t p-4 flex justify-between">
            <Button
              variant="outline"
              asChild
              className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              <Link href={`/itinerary/${itinerary.id}`}>View Details</Link>
            </Button>
            <ItineraryActions id={itinerary.id} onDelete={onDelete} />
          </CardFooter>
        </CardContent>
      </Card>
    </motion.div>
  )
}
