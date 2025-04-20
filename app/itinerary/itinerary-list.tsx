"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import {
  Calendar,
  Clock,
  CreditCard,
  Edit,
  Filter,
  Leaf,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { deleteItinerary } from "./actions"

type Itinerary = {
  id: string
  name: string
  description: string | null
  destination: string
  start_date: string
  end_date: string
  status: "draft" | "planning" | "confirmed" | "completed" | "cancelled"
  carbon_saved: number
  carbon_percentage: number
  budget_total: number
  travel_type: string
  created_at: string
  updated_at: string
  user_id: string
}

interface ItineraryListProps {
  initialItineraries: Itinerary[]
  loading?: boolean
}

export function ItineraryList({ initialItineraries, loading = false }: ItineraryListProps) {
  const router = useRouter()
  const { user } = useUser()
  const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries)
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>(initialItineraries)
  const [isLoading, setIsLoading] = useState(loading)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setItineraries(initialItineraries)
    setFilteredItineraries(initialItineraries)
    setIsLoading(loading)
  }, [initialItineraries, loading])

  useEffect(() => {
    let result = [...itineraries]

    if (activeTab !== "all") {
      result = result.filter((item) => {
        if (activeTab === "upcoming") {
          return ["planning", "confirmed"].includes(item.status)
        } else if (activeTab === "past") {
          return ["completed", "cancelled"].includes(item.status)
        } else if (activeTab === "drafts") {
          return item.status === "draft"
        }
        return true
      })
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.destination.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)),
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "date_asc":
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        case "date_desc":
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        case "carbon_saved":
          return b.carbon_saved - a.carbon_saved
        case "budget_high":
          return b.budget_total - a.budget_total
        case "budget_low":
          return a.budget_total - b.budget_total
        default:
          return 0
      }
    })

    setFilteredItineraries(result)
  }, [itineraries, searchQuery, statusFilter, sortBy, activeTab])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
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

  const getTravelTypeIcon = (type: string) => {
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

  const handleDeleteItinerary = async () => {
    if (!itineraryToDelete || !user) return

    try {
      setIsDeleting(true)

      const result = await deleteItinerary(itineraryToDelete, user.id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete itinerary")
      }

      // Update local state
      setItineraries(itineraries.filter((item) => item.id !== itineraryToDelete))
      toast.success("Itinerary deleted successfully")

      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      toast.error("Failed to delete itinerary")
    } finally {
      setIsDeleting(false)
      setItineraryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSortBy("newest")
    setActiveTab("all")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

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
          <p className="text-muted-foreground">Manage and view all your eco-conscious travel plans</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button asChild>
            <Link href="/itinerary/new">
              <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Itineraries</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <Select value={sortBy} onValueChange={setSortBy}>
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
            {(searchQuery || statusFilter !== "all" || sortBy !== "newest" || activeTab !== "all") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="h-6 w-3/4 mb-2 bg-muted animate-pulse rounded" />
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-2/5 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="border-t p-4 flex justify-between">
                    <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
                    <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : filteredItineraries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-dashed p-8 text-center"
        >
          <h3 className="mb-2 text-lg font-medium">No itineraries found</h3>
          <p className="mb-6 text-muted-foreground">
            {searchQuery || statusFilter !== "all" || activeTab !== "all"
              ? "Try adjusting your filters or search query"
              : "Create your first eco-conscious travel itinerary to get started"}
          </p>
          <Button asChild>
            <Link href="/itinerary/new">
              <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItineraries.map((itinerary) => (
            <motion.div
              key={itinerary.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group"
            >
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold group-hover:text-primary transition-colors duration-200">
                        {itinerary.name}
                      </h3>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        {getStatusBadge(itinerary.status)}
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
                          {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary/70" />
                        <span>
                          <span className="mr-1">{getTravelTypeIcon(itinerary.travel_type)}</span>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="transition-all duration-200 hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/itinerary/${itinerary.id}`} className="cursor-pointer">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/itinerary/${itinerary.id}/refine`} className="cursor-pointer">
                            Refine with AI
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/itinerary/edit/${itinerary.id}`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Itinerary
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setItineraryToDelete(itinerary.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Itinerary
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Itinerary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone and will remove all
              associated days and activities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItinerary} disabled={isDeleting} className="gap-2">
              {isDeleting && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </motion.div>
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
