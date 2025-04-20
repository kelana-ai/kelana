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
  travelType: z.enum(["solo", "couple", "friends", "family"]),
  travelStyles: z.array(z.string()).min(1, {
    message: "Select at least one travel style.",
  }),
  dietaryNeeds: z.array(z.string()),
  budget: z.number().min(100).max(10000),
})

type FormValues = z.infer<typeof formSchema>

const travelTypeOptions = [
  { id: "solo", label: "Solo", icon: "👤", description: "Traveling on your own" },
  { id: "couple", label: "Couple", icon: "👫", description: "Traveling with a partner" },
  { id: "friends", label: "Friends", icon: "👥", description: "Traveling with friends" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧", description: "Traveling with family" },
]

const travelStyles = [
  { id: "healing", label: "Healing", icon: "🧘" },
  { id: "culinary", label: "Culinary", icon: "🍽️" },
  { id: "adventurous", label: "Adventurous", icon: "🧗" },
  { id: "cultural", label: "Cultural & Historical", icon: "🏛️" },
  { id: "urban", label: "Urban & Modern", icon: "🏙️" },
  { id: "backpacker", label: "Backpacker", icon: "🎒" },
  { id: "romantic", label: "Romantic & Honeymoon", icon: "💑" },
  { id: "family-friendly", label: "Family-Friendly", icon: "👨‍👩‍👧‍👦" },
  { id: "spiritual", label: "Spiritual & Religious", icon: "🕌" },
  { id: "photography", label: "Photography & Scenic", icon: "📸" },
]

const dietaryNeeds = [
  { id: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { id: "dairy-free", label: "Dairy-Free", icon: "🥛" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "hindu", label: "Hindu Non-Veg", icon: "🕉️" },
]

const budgetRanges = [
  { value: 500, label: "Budget", description: "Basic accommodations and local food" },
  { value: 2500, label: "Moderate", description: "Mid-range hotels and some dining out" },
  { value: 5000, label: "Comfort", description: "4-star hotels and regular dining out" },
  { value: 7500, label: "Luxury", description: "5-star hotels and premium experiences" },
  { value: 10000, label: "Ultra Luxury", description: "Exclusive accommodations and experiences" },
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
  const formContainerRef = useRef<HTMLDivElement>(null)

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

  function onSubmit(data: FormValues) {
    if (!user) {
      toast.error("You must be logged in to create an itinerary")
      return
    }

    setIsSubmitting(true)

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
          toast.error("Failed to generate itinerary. Please try again.")
          setIsSubmitting(false)
        }
      })
      .catch((error) => {
        toast.error(error.message || "An error occurred while generating the itinerary.")
        setIsSubmitting(false)
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
      setTimeout(() => setCurrentStep((s) => s + 1), 0)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setTimeout(() => setCurrentStep((s) => s - 1), 0)
    }
  }

  const handleDestinationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedDestination(location)
    form.setValue("destination", location)
  }

  const handleHomeLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedHomeLocation(location)
    form.setValue("homeLocation", location)
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
          <div className="relative mb-6 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
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
            <div className="absolute left-0 top-6 h-0.5 w-full -translate-y-1/2 bg-muted" />
            <motion.div
              className="absolute left-0 top-6 h-0.5 -translate-y-1/2 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
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
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      className="pl-9"
                                      placeholder="Search for a destination"
                                      value={field.value.name}
                                      onChange={(e) =>
                                        field.onChange({
                                          ...field.value,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="h-[300px] overflow-hidden rounded-md border">
                                    <MapComponent onLocationSelect={handleDestinationSelect} />
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
                                Search for a destination or click on the map to select a location
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
                                  <div className="relative">
                                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      className="pl-9"
                                      placeholder="Search for your home location"
                                      value={field.value?.name || ""}
                                      onChange={(e) =>
                                        field.onChange({
                                          ...field.value,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="h-[300px] overflow-hidden rounded-md border">
                                    <MapComponent onLocationSelect={handleHomeLocationSelect} />
                                  </div>
                                  {field.value?.name && field.value?.lat !== 0 && (
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
