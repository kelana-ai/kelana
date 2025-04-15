"use client"

import { DestinationCard } from "@/components/destination-card"
import { FeatureCard } from "@/components/feature-card"
import { HeroSection } from "@/components/hero-section"
import { StatCard } from "@/components/stat-card"
import { StepCard } from "@/components/step-card"
import { TestimonialCard } from "@/components/testimonial-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoDialog } from "@/components/video-dialog"
import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Bike, Globe, Leaf, Plane, Recycle, Sparkles, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"

export default function LandingPage() {
  const [videoOpen, setVideoOpen] = useState(false)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const testimonialsRef = useRef(null)
  const destinationsRef = useRef(null)
  const impactRef = useRef(null)
  const newsletterRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 })
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 })
  const destinationsInView = useInView(destinationsRef, { once: true, amount: 0.2 })
  const impactInView = useInView(impactRef, { once: true, amount: 0.2 })
  const newsletterInView = useInView(newsletterRef, { once: true, amount: 0.2 })

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Itinerary Builder",
      description:
        "Create personalized travel plans based on your preferences, with AI that suggests eco-friendly options and local experiences.",
    },
    {
      icon: <Leaf className="h-6 w-6 text-primary" />,
      title: "Greener Stays & Experiences",
      description:
        "Discover accommodations and activities that prioritize sustainability, support local communities, and minimize environmental impact.",
    },
    {
      icon: <Recycle className="h-6 w-6 text-primary" />,
      title: "Budget & Carbon Tracking",
      description:
        "Monitor your travel budget alongside your carbon footprint, with suggestions for reducing both without compromising experiences.",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Share Your Preferences",
      description: "Tell us about your travel style, interests, budget, and sustainability priorities.",
    },
    {
      number: 2,
      title: "Get AI Recommendations",
      description: "Our AI generates a personalized itinerary with eco-friendly options and local experiences.",
    },
    {
      number: 3,
      title: "Refine & Explore",
      description: "Fine-tune your itinerary with our AI assistant, then book and enjoy your greener adventure.",
    },
  ]

  const testimonials = [
    {
      name: "Definda",
      role: "Eco Travel Enthusiast",
      image: "/team/definda.jpg",
      content:
        "Kelana made it easy for me to plan a low-impact getaway. I discovered beautiful local stays and meaningful cultural experiences I wouldn't have known otherwise.",
    },
    {
      name: "Olif",
      role: "Conscious Explorer",
      image: "/team/olif.jpg",
      content:
        "Traveling with Kelana was a game changer. Every destination came with eco-friendly tips and I felt connected to the local communities in a new way.",
    },
    {
      name: "Nadya",
      role: "Cultural Adventurer",
      image: "/team/nadya.jpg",
      content:
        "Kelana showed me how to embrace responsible travel without missing out on adventure. Every step of the trip felt intentional and enriching.",
    },
  ]

  const destinations = [
    {
      name: "Bali, Indonesia",
      image: "/destination/bali.jpg",
      description: "Lush rainforests, sacred temples, and greener retreats",
      ecoScore: 92,
    },
    {
      name: "Costa Rica",
      image: "/destination/costa-rica.jpg",
      description: "Biodiversity hotspot with eco-lodges and conservation areas",
      ecoScore: 95,
    },
    {
      name: "Norway",
      image: "/destination/norway.jpg",
      description: "Fjords, mountains, and renewable energy pioneers",
      ecoScore: 90,
    },
  ]

  const stats = [
    {
      icon: <Plane className="h-8 w-8 text-primary" />,
      value: "45,000+",
      label: "Tons of CO₂ Avoided",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      value: "12,500+",
      label: "Local Businesses Supported",
    },
    {
      icon: <Bike className="h-8 w-8 text-primary" />,
      value: "78%",
      label: "Low-Carbon Transportation",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      value: "$250K+",
      label: "Donated to Conservation",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="container mx-auto px-4 py-24" aria-label="Features section">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Discover Our Features</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore how Kelana helps you create meaningful travel experiences while minimizing your environmental
            footprint.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section ref={destinationsRef} className="bg-muted/30 py-24" aria-label="Popular eco-friendly destinations">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={destinationsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Popular Eco Destinations</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Explore these greener destinations that offer unforgettable experiences with minimal environmental
              impact.
            </p>
          </motion.div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mx-auto w-fit">
              <TabsTrigger value="all">All Destinations</TabsTrigger>
              <TabsTrigger value="asia">Asia</TabsTrigger>
              <TabsTrigger value="americas">Americas</TabsTrigger>
              <TabsTrigger value="europe">Europe</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                animate={destinationsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <DestinationCard
                  name={destination.name}
                  image={destination.image}
                  description={destination.description}
                  ecoScore={destination.ecoScore}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={destinationsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/destinations">
                Explore All Destinations <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="container mx-auto px-4 py-24"
        aria-label="How it works section"
      >
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three simple steps to create your perfect eco-conscious travel experience.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

          <div className="grid gap-12 md:gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={cn("relative grid gap-8 md:grid-cols-2", index % 2 === 1 ? "md:grid-flow-dense" : "")}
              >
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  isEven={index % 2 === 1}
                />
                <div
                  className={cn(
                    "flex items-center justify-center",
                    index % 2 === 1 ? "md:justify-end" : "md:justify-start",
                  )}
                >
                  <div className="relative h-64 w-full max-w-md overflow-hidden rounded-2xl md:h-80">
                    <Image
                      src={`/step/${step.number}.jpg`}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="bg-primary/5 py-24" aria-label="Testimonials section">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">What Travelers Say</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Hear from eco-conscious travelers who have planned their journeys with Kelana.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TestimonialCard
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  content={testimonial.content}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section ref={impactRef} className="container mx-auto px-4 py-24" aria-label="Sustainability impact section">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={impactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Collective Impact</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Together, Kelana travelers are making a difference for our planet and communities.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={impactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard icon={stat.icon} value={stat.value} label={stat.label} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-16 max-w-3xl rounded-2xl border bg-card p-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={impactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold">Our Commitment to Sustainability</h3>
              <p className="text-muted-foreground">
                For every trip booked through Kelana, we contribute to local conservation projects and carbon offset
                initiatives. Together, we're making travel a force for good.
              </p>
            </div>
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/impact">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section
        ref={newsletterRef}
        className="relative overflow-hidden bg-muted/30 py-24"
        aria-label="Newsletter section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 backdrop-blur-sm md:p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">Join Our Eco-Travel Community</h2>
              <p className="mb-8 text-muted-foreground">
                Subscribe to receive greener travel tips, destination guides, and exclusive offers.
              </p>
              <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className="flex-1 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm"
                  aria-label="Email address"
                  required
                />
                <Button type="submit" className="rounded-full px-8">
                  Subscribe
                </Button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Video Dialog */}
      <VideoDialog open={videoOpen} onOpenChange={setVideoOpen} />
    </>
  )
}
