"use client"

import { DestinationCard } from "@/components/destination-card"
import { FeatureCard } from "@/components/feature-card"
import { HeroSection } from "@/components/hero-section"
import { StepCard } from "@/components/step-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Leaf, Recycle, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Day-by-day itineraries",
    description:
      "Describe the trip once and get a day-by-day plan that fits your travel style, diet and budget, with low-impact transport and local places first.",
  },
  {
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: "Lower-carbon choices",
    description:
      "Plans favour rail and bus over flights, walkable routes, locally owned places and plant-based food. Stops with a known location are pinned on a map.",
  },
  {
    icon: <Recycle className="h-6 w-6 text-primary" />,
    title: "Budget & Carbon Estimates",
    description:
      "See an estimated cost per activity and an AI-generated estimate of the CO₂ your plan avoids. Estimates are a guide, not an audited figure.",
  },
]

const steps = [
  {
    number: 1,
    title: "Describe the trip",
    description: "Tell us your destination, dates, travel style, dietary needs and budget.",
  },
  {
    number: 2,
    title: "Get a plan",
    description: "Kelana writes a day-by-day itinerary with low-impact options and local places.",
  },
  {
    number: 3,
    title: "Refine and download",
    description: "Ask for changes in plain text, download the plan, and check the stops on the map.",
  },
]

const destinations = [
  {
    name: "Bali, Indonesia",
    image: "/destination/bali.jpg",
    description: "Lush rainforests, sacred temples and community-run retreats",
  },
  {
    name: "Costa Rica",
    image: "/destination/costa-rica.jpg",
    description: "Biodiversity hotspot with eco-lodges and conservation areas",
  },
  {
    name: "Norway",
    image: "/destination/norway.jpg",
    description: "Fjords, mountains and train-friendly travel",
  },
]

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <section id="features" className="container mx-auto px-4 py-24" aria-label="Features section">
        <Reveal className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">What Kelana does</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Plan a trip, see its estimated cost and carbon, and adjust it until it fits.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.1}>
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-24" aria-label="Destination inspiration">
        <div className="container mx-auto px-4">
          <Reveal className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Where Will You Go?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Need inspiration? Pick a destination and Kelana will start your plan from there.
            </p>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination, index) => (
              <Reveal key={destination.name} delay={index * 0.1}>
                <DestinationCard name={destination.name} image={destination.image} description={destination.description} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto px-4 py-24" aria-label="How it works section">
        <Reveal className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From a rough idea to a day-by-day plan in three steps.
          </p>
        </Reveal>

        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

          <div className="grid gap-12 md:gap-16">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.2} className={cn("relative grid gap-8 md:grid-cols-2", index % 2 === 1 ? "md:grid-flow-dense" : "")}>
                <StepCard number={step.number} title={step.title} description={step.description} isEven={index % 2 === 1} />
                <div className={cn("flex items-center justify-center", index % 2 === 1 ? "md:justify-end" : "md:justify-start")}>
                  <div className="relative h-64 w-full max-w-md overflow-hidden rounded-2xl md:h-80">
                    <Image
                      src={`/step/${step.number}.jpg`}
                      alt={step.title}
                      fill
                      sizes="(min-width: 768px) 28rem, 100vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sustainability" className="bg-primary/5 py-24" aria-label="Sustainability approach">
        <div className="container mx-auto px-4">
          <Reveal className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">About the numbers</h2>
            <p className="mb-6 text-muted-foreground">
              Kelana favours lower-carbon transport, locally owned places and plant-based food, and shows an estimated cost
              and CO₂ saving for each plan. The figures are AI-generated estimates for comparing options. Check details with
              providers before you travel.
            </p>
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/signup">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
