"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { submitItinerary } from "./actions"
import { steps } from "./constants"
import { ErrorRecovery } from "./error-recovery"
import { LoadingExperience } from "./loading-experience"
import { formSchema, type FormValues } from "./schema"
import { BudgetStep } from "./steps/budget-step"
import { DietaryNeedsStep } from "./steps/dietary-needs-step"
import { HomeLocationStep } from "./steps/home-location-step"
import { ReviewStep } from "./steps/review-step"
import { TravelStylesStep } from "./steps/travel-styles-step"
import { TravelTypeStep } from "./steps/travel-type-step"
import { TripDetailsStep } from "./steps/trip-details-step"

const stepDescriptions = [
  "Tell us about your trip destination and dates",
  "Where are you starting your journey from?",
  "Who will be joining you on this adventure?",
  "What kind of experiences are you looking for?",
  "Any special dietary requirements we should know about?",
  "Let's set a budget for your eco-friendly journey",
  "Review your itinerary details before we generate your plan",
]

export default function NewItineraryPage() {
  const { user, profile, isLoading } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoadingExperience, setShowLoadingExperience] = useState(false)
  const [showError, setShowError] = useState<Error | null>(null)
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
      window.scrollTo({ top: 0, behavior: "smooth" })
      formContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentStep])

  function onSubmit(data: FormValues) {
    if (!user) {
      toast.error("You must be logged in to create an itinerary")
      return
    }

    window.scrollTo({ top: 0, behavior: "smooth" })

    setIsSubmitting(true)
    setShowLoadingExperience(true)

    const formData = new FormData()
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

  const handleRetry = () => {
    setShowError(null)
    setIsSubmitting(true)
    setShowLoadingExperience(true)
    onSubmit(form.getValues())
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
                    <CardDescription>{stepDescriptions[currentStep]}</CardDescription>
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
                    {currentStep === 0 && <TripDetailsStep form={form} />}
                    {currentStep === 1 && <HomeLocationStep form={form} />}
                    {currentStep === 2 && <TravelTypeStep form={form} />}
                    {currentStep === 3 && <TravelStylesStep form={form} />}
                    {currentStep === 4 && <DietaryNeedsStep form={form} />}
                    {currentStep === 5 && <BudgetStep form={form} />}
                    {currentStep === 6 && <ReviewStep form={form} />}
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
