"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Home,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Users,
  Utensils,
  Wallet,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { submitItinerary } from "./actions"
import { ErrorRecovery } from "./error-recovery"
import { LoadingExperience } from "./loading-experience"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center rounded-md border border-dashed">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
})

const steps = [
  { id: "step-1", name: "Trip Details", icon: MapPin },
  { id: "step-2", name: "Home Location", icon: Home },
  { id: "step-3", name: "Travel Type", icon: Users },
  { id: "step-4", name: "Preferences", icon: Sparkles },
  { id: "step-5", name: "Dietary Needs", icon: Utensils },
  { id: "step-6", name: "Budget", icon: Wallet },
  { id: "step-7", name: "Review", icon: Check },
]

const formSchema = z.object({
  tripName: z.string().min(2, {
    message: "Trip name must be at least 2 characters.",
  }),
  destination: z.object({
    name: z.string().min(2, { message: "Destination is required." }),
    lat: z.number(),
    lng: z.number(),
  }),
  homeLocation: z
    .object({
      name: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  travelType: z.enum(["solo", "partners", "groups", "family", "business", "digital-nomad", "pet-friendly"]),
  travelStyles: z.array(z.string()).min(1, {
    message: "Select at least one travel style.",
  }),
  dietaryNeeds: z.array(z.string()),
  budget: z.number().min(100).max(10000),
})

type FormValues = z.infer<typeof formSchema>

const travelTypeOptions = [
  { id: "solo",          label: "Solo Explorer",     icon: "👤", description: "Just me, myself, and I" },
  { id: "partners",      label: "Partners",          icon: "🧑‍🤝‍🧑", description: "Traveling with a partner" },
  { id: "groups",        label: "Groups",            icon: "👥", description: "With friends or a small crew" },
  { id: "family",        label: "Family",            icon: "👨‍👩‍👧‍👦", description: "Kids, parents, or multigenerational" },
  { id: "business",      label: "Business Traveler", icon: "💼", description: "On a work trip" },
  { id: "digital-nomad", label: "Digital Nomad",     icon: "💻", description: "Work-from-anywhere lifestyle" },
  { id: "pet-friendly",  label: "Pet Parent",        icon: "🐾", description: "Bringing my furry friend" },
]

const travelStyles = [
  { id: "wellness",        label: "Wellness & Spa",       icon: "🧘" },
  { id: "romantic",        label: "Romantic",             icon: "💑" },
  { id: "family-friendly", label: "Family-Friendly",      icon: "👨‍👩‍👧‍👦" },
  { id: "cultural",        label: "Culture & History",    icon: "🏛️" },
  { id: "culinary",        label: "Foodie Adventures",    icon: "🍽️" },
  { id: "festivals",       label: "Festivals & Events",   icon: "🎉" },
  { id: "shopping",        label: "Shopping & Style",     icon: "🛍️" },
  { id: "adventure",       label: "Adventure & Outdoors", icon: "🧗" },
  { id: "nature",          label: "Nature & Wildlife",    icon: "🦜" },
  { id: "urban",           label: "Urban Life",           icon: "🏙️" },
  { id: "roadtrip",        label: "Road Trip",            icon: "🛣️" },
  { id: "cruise",          label: "Cruise Voyages",       icon: "🚢" },
  { id: "backpacker",      label: "Budget Backpacker",    icon: "🎒" },
  { id: "photography",     label: "Photography & Scenic", icon: "📸" },
  { id: "spiritual",       label: "Spiritual Journeys",   icon: "🕌" },
]

const dietaryNeeds = [
  { id: "vegetarian",       label: "Vegetarian",       icon: "🥗" },
  { id: "vegan",            label: "Vegan",            icon: "🌿" },
  { id: "pescatarian",      label: "Pescatarian",      icon: "🐟" },
  { id: "gluten-free",      label: "Gluten-Free",      icon: "🌾" },
  { id: "dairy-free",       label: "Dairy-Free",       icon: "🥛" },
  { id: "nut-free",         label: "Nut-Free",         icon: "🥜" },
  { id: "shellfish-free",   label: "Shellfish-Free",   icon: "🦐" },
  { id: "halal",            label: "Halal",            icon: "☪️" },
  { id: "allergy-friendly", label: "Allergy-Friendly", icon: "⚠️" },
]

const budgetRanges = [
  { value: 200,   label: "Economy" },
  { value: 1200,  label: "Standard" },
  { value: 4500,  label: "Premium" },
  { value: 7500,  label: "Luxury" },
  { value: 10000, label: "Ultra Luxury" },
]

export default function NewItineraryPage() {
  const { user, profile, isLoading } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<{ name: string; lat: number; lng: number } | null>(
    null,
  )
  const [selectedHomeLocation, setSelectedHomeLocation] = useState<{ name: string; lat: number; lng: number } | null>(
    null,
  )
  const [showLoadingExperience, setShowLoadingExperience] = useState(false)
  const [showError, setShowError] = useState<Error | null>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  const [destinationSearchQuery, setDestinationSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      display_name: string
      lat: string
      lon: string
    }>
  >([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const [homeLocationSearchQuery, setHomeLocationSearchQuery] = useState("")
  const [isHomeSearching, setIsHomeSearching] = useState(false)
  const [homeSearchResults, setHomeSearchResults] = useState<
    Array<{
      display_name: string
      lat: string
      lon: string
    }>
  >([])
  const [showHomeSearchResults, setShowHomeSearchResults] = useState(false)
  const homeMapRef = useRef<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripName: "",
      destination: { name: "", lat: 0, lng: 0 },
      homeLocation:
        profile?.home_lat && profile?.home_lng ? { name: "", lat: profile.home_lat, lng: profile.home_lng } : undefined,
      dateRange: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 7)),
      },
      travelType: "solo",
      travelStyles: profile?.preferences?.travelStyles || [],
      dietaryNeeds: profile?.dietary_needs || [],
      budget: 2500,
    },
  })

  useEffect(() => {
    if (formContainerRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      formContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentStep])

  useEffect(() => {
    if (selectedDestination) {
      form.setValue("destination", selectedDestination)
    }
  }, [selectedDestination, form])

  useEffect(() => {
    if (selectedHomeLocation) {
      form.setValue("homeLocation", selectedHomeLocation)
    }
  }, [selectedHomeLocation, form])

  const searchLocation = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsSearching(true)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to search location")
      }

      const data = await response.json()

      if (data && data.length > 0) {
        setSearchResults(data)
        setShowSearchResults(true)
      } else {
        toast.error("Location not found. Try a different search term.")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching location:", error)
      toast.error("Failed to search location. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const searchHomeLocation = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsHomeSearching(true)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to search location")
      }

      const data = await response.json()

      if (data && data.length > 0) {
        setHomeSearchResults(data)
        setShowHomeSearchResults(true)
      } else {
        toast.error("Location not found. Try a different search term.")
        setHomeSearchResults([])
      }
    } catch (error) {
      console.error("Error searching location:", error)
      toast.error("Failed to search location. Please try again.")
    } finally {
      setIsHomeSearching(false)
    }
  }

  const selectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const location = {
      name: result.display_name,
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
    }

    setSelectedDestination(location)
    setDestinationSearchQuery(result.display_name)
    setShowSearchResults(false)

    if (mapRef.current?.setLocation) {
      mapRef.current.setLocation(location)
    }
  }

  const selectHomeSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const location = {
      name: result.display_name,
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
    }

    setSelectedHomeLocation(location)
    setHomeLocationSearchQuery(result.display_name)
    setShowHomeSearchResults(false)

    if (homeMapRef.current?.setLocation) {
      homeMapRef.current.setLocation(location)
    }
  }

  function onSubmit(data: FormValues) {
    if (!user) {
      toast.error("You must be logged in to create an itinerary")
      return
    }

    window.scrollTo({ top: 0, behavior: "smooth" })

    setIsSubmitting(true)
    setShowLoadingExperience(true)

    const formData = new FormData()
    formData.append("userId", user.id)
    formData.append("tripName", data.tripName)
    formData.append("destination", JSON.stringify(data.destination))
    formData.append("homeLocation", JSON.stringify(data.homeLocation || {}))
    formData.append(
      "dateRange",
      JSON.stringify({
        from: data.dateRange.from.toISOString(),
        to: data.dateRange.to.toISOString(),
      }),
    )
    formData.append("travelType", data.travelType)
    formData.append("travelStyles", JSON.stringify(data.travelStyles))
    formData.append("dietaryNeeds", JSON.stringify(data.dietaryNeeds))
    formData.append("budget", data.budget.toString())

    submitItinerary(formData)
      .then((response) => {
        if (response.success && response.itineraryId) {
          toast.success("Itinerary generated successfully!")
          router.push(`/itinerary/${response.itineraryId}`)
        } else {
          setShowError(new Error(response.error || "Failed to generate itinerary"))
          setIsSubmitting(false)
          setShowLoadingExperience(false)
        }
      })
      .catch((error) => {
        setShowError(error)
        setIsSubmitting(false)
        setShowLoadingExperience(false)
      })
  }

  async function nextStep() {
    if (currentStep === 0) {
      const tripNameValid = await form.trigger("tripName")
      const destinationValid = await form.trigger("destination")
      const dateRangeValid = await form.trigger("dateRange")
      if (!tripNameValid || !destinationValid || !dateRangeValid) return
    } else if (currentStep === 2) {
      if (!(await form.trigger("travelType"))) return
    } else if (currentStep === 3) {
      if (!(await form.trigger("travelStyles"))) return
    }
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep((s) => s + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 0)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setTimeout(() => {
        setCurrentStep((s) => s - 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 0)
    }
  }

  const handleMapLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedDestination(location)
    setDestinationSearchQuery(location.name)
  }

  const handleHomeLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedHomeLocation(location)
  }

  const handleRetry = () => {
    setShowError(null)
    setIsSubmitting(true)
    setShowLoadingExperience(true)

    const data = form.getValues()
    onSubmit(data)
  }

  const handleCancel = () => {
    setShowError(null)
  }

  if (showLoadingExperience) {
    return showError ? (
      <ErrorRecovery error={showError} onRetry={handleRetry} onCancel={handleCancel} />
    ) : (
      <LoadingExperience
        destination={form.getValues().destination.name}
        tripName={form.getValues().tripName}
        onError={(error) => setShowError(error)}
      />
    )
  }

  return (
    <div className="container py-8" ref={formContainerRef}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Create Your Eco-Friendly Itinerary</h1>
          <p className="mt-2 text-muted-foreground">
            Let's plan a sustainable travel experience that's good for you and the planet
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-10 hidden md:block">
          <div className="relative mb-6 flex items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
                    currentStep === index
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : currentStep > index
                        ? "bg-primary/80 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > index ? <Check className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
                  <AnimatePresence>
                    {currentStep === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -inset-1 rounded-full border-2 border-primary"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    currentStep === index ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.name}
                </p>
              </div>
            ))}
            <div className="absolute left-1/2 -translate-x-1/2 top-6 h-0.5 w-[85%] -translate-y-1/2">
              <div className="h-full w-full bg-muted" />
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <p className="text-sm font-medium">
            Step {currentStep + 1} of {steps.length}
          </p>
          <p className="text-sm font-medium">{steps[currentStep].name}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {(() => {
                      const Icon = steps[currentStep].icon
                      return <Icon className="h-4 w-4" />
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{steps[currentStep].name}</CardTitle>
                    <CardDescription>
                      {currentStep === 0 && "Tell us about your trip destination and dates"}
                      {currentStep === 1 && "Where are you starting your journey from?"}
                      {currentStep === 2 && "Who will be joining you on this adventure?"}
                      {currentStep === 3 && "What kind of experiences are you looking for?"}
                      {currentStep === 4 && "Any special dietary requirements we should know about?"}
                      {currentStep === 5 && "Let's set a budget for your eco-friendly journey"}
                      {currentStep === 6 && "Review your itinerary details before we generate your plan"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 1: Trip Details */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="tripName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trip Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Bali Eco Adventure" {...field} />
                              </FormControl>
                              <FormDescription>
                                Give your trip a memorable name to easily identify it later
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel>Destination</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  {/* Separate search input outside the map */}
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        type="text"
                                        placeholder="Search for a destination..."
                                        className="pl-9 pr-10"
                                        value={destinationSearchQuery}
                                        onChange={(e) => setDestinationSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault()
                                            searchLocation(destinationSearchQuery)
                                          }
                                        }}
                                      />
                                      {isSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => searchLocation(destinationSearchQuery)}
                                      disabled={isSearching || !destinationSearchQuery.trim()}
                                    >
                                      Search
                                    </Button>
                                  </div>

                                  {/* Search results dropdown */}
                                  {showSearchResults && searchResults.length > 0 && (
                                    <div className="relative">
                                      <div className="absolute left-0 right-0 top-0 z-50 max-h-60 overflow-auto rounded-md border bg-background shadow-md">
                                        <ul className="py-1">
                                          {searchResults.map((result, index) => (
                                            <li
                                              key={index}
                                              className="cursor-pointer px-4 py-2 text-sm hover:bg-accent"
                                              onClick={() => selectSearchResult(result)}
                                            >
                                              {result.display_name}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  <div className="h-[300px] overflow-hidden rounded-md border">
                                    <MapComponent onLocationSelect={handleMapLocationSelect} ref={mapRef} />
                                  </div>

                                  {field.value.name && field.value.lat !== 0 && (
                                    <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-sm">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>
                                        Selected: <strong>{field.value.name}</strong>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                Search for a location or click directly on the map to select your destination
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateRange"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Travel Dates</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {field.value?.from ? (
                                        field.value.to ? (
                                          <>
                                            {format(field.value.from, "MMM d, yyyy")} -{" "}
                                            {format(field.value.to, "MMM d, yyyy")}
                                          </>
                                        ) : (
                                          format(field.value.from, "MMM d, yyyy")
                                        )
                                      ) : (
                                        <span>Select travel dates</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="range"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    numberOfMonths={2}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>Select the start and end dates for your trip</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 2: Home Location */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="homeLocation"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel>Your Home Location</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  {/* Separate search input outside the map */}
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        type="text"
                                        placeholder="Search for your home location..."
                                        className="pl-9 pr-10"
                                        value={homeLocationSearchQuery}
                                        onChange={(e) => setHomeLocationSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault()
                                            searchHomeLocation(homeLocationSearchQuery)
                                          }
                                        }}
                                      />
                                      {isHomeSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => searchHomeLocation(homeLocationSearchQuery)}
                                      disabled={isHomeSearching || !homeLocationSearchQuery.trim()}
                                    >
                                      Search
                                    </Button>
                                  </div>

                                  {/* Search results dropdown */}
                                  {showHomeSearchResults && homeSearchResults.length > 0 && (
                                    <div className="relative">
                                      <div className="absolute left-0 right-0 top-0 z-50 max-h-60 overflow-auto rounded-md border bg-background shadow-md">
                                        <ul className="py-1">
                                          {homeSearchResults.map((result, index) => (
                                            <li
                                              key={index}
                                              className="cursor-pointer px-4 py-2 text-sm hover:bg-accent"
                                              onClick={() => selectHomeSearchResult(result)}
                                            >
                                              {result.display_name}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  <div className="h-[300px] overflow-hidden rounded-md border">
                                    <MapComponent onLocationSelect={handleHomeLocationSelect} ref={homeMapRef} />
                                  </div>

                                  {field.value?.name &&
                                    field.value?.lat !== undefined &&
                                    field.value?.lng !== undefined && (
                                      <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-sm">
                                        <Home className="h-4 w-4 text-primary" />
                                        <span>
                                          Selected: <strong>{field.value.name}</strong>
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                This helps us calculate carbon emissions and suggest eco-friendly transportation options
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 3: Travel Type */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="travelType"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel>Who are you traveling with?</FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                                  {travelTypeOptions.map((option) => (
                                    <div
                                      key={option.id}
                                      className={cn(
                                        "flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-all hover:bg-accent",
                                        field.value === option.id ? "border-primary bg-primary/5" : "border-muted",
                                      )}
                                      onClick={() => field.onChange(option.id)}
                                    >
                                      <div className="mb-3 text-4xl">{option.icon}</div>
                                      <h3 className="mb-1 font-medium">{option.label}</h3>
                                      <p className="text-center text-xs text-muted-foreground">{option.description}</p>
                                      {field.value === option.id && (
                                        <div className="mt-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                          Selected
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 4: Travel Styles */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="travelStyles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What kind of experiences are you looking for?</FormLabel>
                              <FormDescription className="mb-4">
                                Select all that apply to personalize your itinerary
                              </FormDescription>
                              <FormControl>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                  {travelStyles.map((style) => (
                                    <label
                                      key={style.id}
                                      className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                                        field.value?.includes(style.id)
                                          ? "border-primary bg-primary/5"
                                          : "border-muted",
                                      )}
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(style.id)}
                                        onCheckedChange={(checked) =>
                                          checked
                                            ? field.onChange([...field.value, style.id])
                                            : field.onChange(field.value?.filter((v) => v !== style.id) || [])
                                        }
                                        className="h-5 w-5"
                                      />
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{style.icon}</span>
                                        <span>{style.label}</span>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 5: Dietary Needs */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="dietaryNeeds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dietary Preferences (Optional)</FormLabel>
                              <FormDescription className="mb-4">
                                Select any dietary requirements for your trip
                              </FormDescription>
                              <FormControl>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                  {dietaryNeeds.map((diet) => (
                                    <label
                                      key={diet.id}
                                      className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                                        field.value?.includes(diet.id) ? "border-primary bg-primary/5" : "border-muted",
                                      )}
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(diet.id)}
                                        onCheckedChange={(checked) =>
                                          checked
                                            ? field.onChange([...field.value, diet.id])
                                            : field.onChange(field.value?.filter((v) => v !== diet.id) || [])
                                        }
                                        className="h-5 w-5"
                                      />
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{diet.icon}</span>
                                        <span>{diet.label}</span>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 6: Budget */}
                    {currentStep === 5 && (
                      <div className="space-y-8">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trip Budget (USD)</FormLabel>
                              <FormDescription className="mb-6">
                                Drag the slider to set your total budget for this trip
                              </FormDescription>
                              <FormControl>
                                <div className="space-y-8">
                                  <Tabs
                                    defaultValue={getBudgetTabValue(field.value)}
                                    onValueChange={(val) => {
                                      const found = budgetRanges.find((r) => r.label === val)
                                      if (found) field.onChange(found.value)
                                    }}
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-5">
                                      {budgetRanges.map((r) => (
                                        <TabsTrigger key={r.label} value={r.label}>
                                          {r.label}
                                        </TabsTrigger>
                                      ))}
                                    </TabsList>
                                  </Tabs>

                                  <Slider
                                    min={100}
                                    max={10000}
                                    step={100}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="py-4"
                                  />

                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">$100</span>
                                    <span className="text-2xl font-semibold text-primary">${field.value}</span>
                                    <span className="text-sm text-muted-foreground">$10,000</span>
                                  </div>

                                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                                    <h3 className="mb-3 font-medium">Estimated Budget Breakdown</h3>
                                    <BudgetItem
                                      label="Accommodation"
                                      amount={Math.round(field.value * 0.4)}
                                      percentage={40}
                                    />
                                    <BudgetItem
                                      label="Transportation"
                                      amount={Math.round(field.value * 0.2)}
                                      percentage={20}
                                    />
                                    <BudgetItem
                                      label="Food & Dining"
                                      amount={Math.round(field.value * 0.2)}
                                      percentage={20}
                                    />
                                    <BudgetItem
                                      label="Activities"
                                      amount={Math.round(field.value * 0.15)}
                                      percentage={15}
                                    />
                                    <BudgetItem
                                      label="Miscellaneous"
                                      amount={Math.round(field.value * 0.05)}
                                      percentage={5}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 7: Review */}
                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                          <h3 className="mb-4 text-lg font-semibold">Trip Summary</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <SummaryItem
                              icon={<MapPin className="h-4 w-4" />}
                              label="Destination"
                              value={form.getValues().destination.name}
                            />
                            <SummaryItem
                              icon={<Home className="h-4 w-4" />}
                              label="Home Location"
                              value={form.getValues().homeLocation?.name || "Not specified"}
                            />
                            <SummaryItem
                              icon={<Calendar className="h-4 w-4" />}
                              label="Dates"
                              value={`${format(form.getValues().dateRange.from, "MMM d")} - ${format(
                                form.getValues().dateRange.to,
                                "MMM d, yyyy",
                              )}`}
                            />
                            <SummaryItem
                              icon={<Users className="h-4 w-4" />}
                              label="Travel Type"
                              value={travelTypeOptions.find((t) => t.id === form.getValues().travelType)?.label || ""}
                            />
                            <SummaryItem
                              icon={<Wallet className="h-4 w-4" />}
                              label="Budget"
                              value={`$${form.getValues().budget}`}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                          <h3 className="mb-4 text-lg font-semibold">Travel Styles</h3>
                          <div className="flex flex-wrap gap-2">
                            {form.getValues().travelStyles.map((style) => (
                              <Badge key={style} variant="secondary" className="text-sm">
                                {travelStyles.find((s) => s.id === style)?.icon}{" "}
                                {travelStyles.find((s) => s.id === style)?.label}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {form.getValues().dietaryNeeds.length > 0 && (
                          <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold">Dietary Preferences</h3>
                            <div className="flex flex-wrap gap-2">
                              {form.getValues().dietaryNeeds.map((diet) => (
                                <Badge key={diet} variant="outline" className="text-sm">
                                  {dietaryNeeds.find((d) => d.id === diet)?.icon}{" "}
                                  {dietaryNeeds.find((d) => d.id === diet)?.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="rounded-lg bg-primary/10 p-6">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/20 p-2 text-primary">
                              <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="mb-2 font-medium text-primary">Eco-Conscious Planning</h3>
                              <p className="text-sm text-muted-foreground">
                                We'll prioritize sustainable accommodations, low-carbon transportation options, and
                                experiences that support local communities based on your preferences.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex w-full gap-2 sm:w-auto">
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep} className="w-full sm:w-auto">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          Generate Itinerary <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}

function BudgetItem({
  label,
  amount,
  percentage,
}: {
  label: string
  amount: number
  percentage: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="font-medium">${amount}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function getBudgetTabValue(value: number): string {
  if (value <= 1000) return "Budget"
  if (value <= 3000) return "Moderate"
  if (value <= 6000) return "Comfort"
  if (value <= 8000) return "Luxury"
  return "Ultra Luxury"
}
