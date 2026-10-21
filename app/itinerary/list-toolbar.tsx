import { AnimatePresence, motion } from "framer-motion"
import { Filter, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isFiltering, type ListFilters } from "@/lib/itinerary-filters"

interface ListToolbarProps {
  filters: ListFilters
  onChange: (change: Partial<ListFilters>) => void
  onClear: () => void
}

export function ListTabs({ tab, onChange }: { tab: string; onChange: (tab: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <Tabs defaultValue="all" value={tab} onValueChange={onChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Itineraries</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  )
}

export function ListToolbar({ filters, onChange, onClear }: ListToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6 flex flex-col gap-4 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search itineraries..."
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="pl-9"
        />
        <AnimatePresence>
          {filters.query && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={() => onChange({ query: "" })}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <Select value={filters.status} onValueChange={(status) => onChange({ status })}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(sort) => onChange({ sort })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="date_asc">Travel Date (Earliest)</SelectItem>
            <SelectItem value="date_desc">Travel Date (Latest)</SelectItem>
            <SelectItem value="carbon_saved">Highest Carbon Savings</SelectItem>
            <SelectItem value="budget_high">Budget (High to Low)</SelectItem>
            <SelectItem value="budget_low">Budget (Low to High)</SelectItem>
          </SelectContent>
        </Select>

        <AnimatePresence>
          {isFiltering(filters) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="outline" onClick={onClear}>
                Clear Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
