"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Brain,
  Calendar,
  Check,
  Clock,
  Compass,
  Globe,
  Leaf,
  MapPin,
  Palmtree,
  Plane,
  Route,
  Sparkles,
  Sun,
  Train,
  Utensils,
} from "lucide-react"
import { useEffect, useState } from "react"

interface LoadingExperienceProps {
  destination: string
  tripName: string
  onError?: (error: Error) => void
}

const loadingMessages = [
  {
    message: "Researching eco-friendly accommodations",
    icon: <Palmtree className="h-5 w-5" />,
  },
  {
    message: "Finding sustainable transportation options",
    icon: <Train className="h-5 w-5" />,
  },
  {
    message: "Discovering local dining experiences",
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    message: "Calculating carbon footprint savings",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    message: "Planning daily activities",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    message: "Mapping out your journey",
    icon: <Route className="h-5 w-5" />,
  },
  {
    message: "Optimizing your travel route",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    message: "Checking for seasonal events",
    icon: <Sun className="h-5 w-5" />,
  },
  {
    message: "Finding hidden local gems",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    message: "Finalizing your eco-conscious itinerary",
    icon: <Check className="h-5 w-5" />,
  },
]

const ecoFacts = [
  "Choosing trains over flights can reduce your carbon footprint by up to 90%.",
  "Staying in eco-certified accommodations can save up to 20% in water consumption.",
  "Supporting local businesses keeps approximately 68% of your money in the local economy.",
  "Reusable water bottles can prevent hundreds of single-use plastic bottles from entering landfills during your trip.",
  "Walking tours generate zero carbon emissions and provide the best way to experience a destination like a local.",
  "Plant-based meals typically have a carbon footprint 50% smaller than meat-based alternatives.",
  "Sustainable tourism helps preserve over 30% of the world's natural and cultural heritage sites.",
  "Eco-friendly travel can reduce your vacation's carbon footprint by up to 40%.",
  "Slow travel (staying longer in fewer places) can reduce your trip's environmental impact by up to 30%.",
  "Choosing digital tickets and guides saves approximately 1 tree for every 100 travelers.",
]

export function LoadingExperience({ destination, tripName, onError }: LoadingExperienceProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [animatingIcons, setAnimatingIcons] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = prev < 70 ? 1.5 : prev < 90 ? 0.7 : 0.3
        const newProgress = Math.min(99, prev + increment)
        return newProgress
      })
    }, 300)

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 3500)

    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ecoFacts.length)
    }, 8000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearInterval(factInterval)
    }
  }, [])

  const iconVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  const floatingIcons = [
    <Plane key="plane" className="text-blue-500" />,
    <Leaf key="leaf" className="text-green-500" />,
    <Globe key="globe" className="text-primary" />,
    <Sun key="sun" className="text-amber-500" />,
    <MapPin key="map" className="text-red-500" />,
    <Clock key="clock" className="text-purple-500" />,
    <Brain key="brain" className="text-pink-500" />,
  ]

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Creating Your Adventure</h1>
        <p className="mt-2 text-muted-foreground">
          We're crafting your perfect eco-friendly itinerary for{" "}
          <span className="font-medium text-primary">{destination}</span>
        </p>
      </motion.div>

      <div className="relative mb-12 h-40 w-40">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="h-40 w-40 rounded-full border-4 border-dashed border-primary/30"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="h-32 w-32 rounded-full border-4 border-dashed border-primary/50"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-24 w-24 rounded-full bg-primary/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                <Sparkles className="h-10 w-10 text-primary" />
              </motion.div>
            </div>
            {animatingIcons && (
              <div className="absolute inset-0">
                {floatingIcons.map((icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                      x: Math.sin(i * 45) * 50,
                      y: Math.cos(i * 45) * 50,
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: floatingIcons.length * 0.5,
                    }}
                  >
                    {icon}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 w-full max-w-md"
      >
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Generating "{tripName}"</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8 h-16"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={iconVariants}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary"
          >
            {loadingMessages[currentMessageIndex].icon}
            <span>{loadingMessages[currentMessageIndex].message}...</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-green-500" />
              Did You Know?
            </CardTitle>
            <CardDescription>Eco-friendly travel facts</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="min-h-[60px] text-muted-foreground"
              >
                {ecoFacts[factIndex]}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <ArrowRight className="h-4 w-4" />
        </motion.div>
        <span>You'll be redirected automatically when your itinerary is ready</span>
      </motion.div>
    </div>
  )
}
