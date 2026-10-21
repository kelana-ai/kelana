"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { effectiveStatus, toDateKey } from "@/lib/itinerary"
import { DEFAULT_FILTERS, filterItineraries, isNarrowed, type Itinerary, type ListFilters } from "@/lib/itinerary-filters"
import { staggerChildren } from "@/lib/motion"
import { DeleteItineraryDialog } from "./delete-itinerary-dialog"
import { ItineraryCard } from "./itinerary-card"
import { ListTabs, ListToolbar } from "./list-toolbar"
import { useItineraryDeletion } from "./use-itinerary-deletion"

const container = staggerChildren(0.05)

interface ItineraryListProps {
  initialItineraries: Itinerary[]
  loadFailed?: boolean
}

export function ItineraryList({ initialItineraries, loadFailed = false }: ItineraryListProps) {
  const router = useRouter()
  const [stored, setItineraries] = useState<Itinerary[]>(initialItineraries)
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS)
  const deletion = useItineraryDeletion((id) => setItineraries((prev) => prev.filter((item) => item.id !== id)))

  const itineraries = useMemo(() => {
    const today = toDateKey(new Date())
    return stored.map((item) => ({ ...item, status: effectiveStatus(item.status, item.end_date, today) as Itinerary["status"] }))
  }, [stored])

  const visible = useMemo(() => filterItineraries(itineraries, filters), [itineraries, filters])

  const change = (partial: Partial<ListFilters>) => setFilters((current) => ({ ...current, ...partial }))

  return (
    <div className="container py-8">
      <motion.div
        className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Itineraries</h1>
          <p className="text-muted-foreground">All your itineraries</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Button asChild>
            <Link href="/itinerary/new">
              <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <ListTabs tab={filters.tab} onChange={(tab) => change({ tab })} />
      <ListToolbar filters={filters} onChange={change} onClear={() => setFilters(DEFAULT_FILTERS)} />

      {loadFailed ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">We couldn't load your itineraries</h3>
          <p className="mb-6 text-muted-foreground">Please refresh the page or try again in a moment.</p>
          <Button onClick={() => router.refresh()}>Retry</Button>
        </div>
      ) : visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-dashed p-8 text-center"
        >
          <h3 className="mb-2 text-lg font-medium">No itineraries found</h3>
          <p className="mb-6 text-muted-foreground">
            {isNarrowed(filters) ? "Try adjusting your filters or search query" : "Create your first itinerary to get started"}
          </p>
          <Button asChild>
            <Link href="/itinerary/new">
              <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((itinerary) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} onDelete={deletion.request} />
          ))}
        </motion.div>
      )}

      <DeleteItineraryDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        isDeleting={deletion.isDeleting}
        onConfirm={deletion.confirm}
      />
    </div>
  )
}
