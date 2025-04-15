"use client"

import { motion } from "framer-motion"
import { ArrowRight, Globe, Leaf, Play, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoDialog } from "@/components/video-dialog"

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: "AI-Powered Itinerary Planning",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      text: "Eco-Conscious Recommendations",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      text: "Support Local Communities",
    },
  ]

  return (
    <section className="relative overflow-hidden" aria-label="Hero section">
      {/* Background image and overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Scenic mountain landscape with greener travel elements"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background/90" />
      </div>

      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid min-h-[90vh] items-center py-20 md:grid-cols-2 md:gap-12 lg:min-h-[85vh]">
          {/* Left column - Text content */}
          <motion.div
            className="flex flex-col items-start text-left"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-4">
              <Badge className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                Greener Travel Planning
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              Plan Meaningful, <br className="hidden sm:inline" />
              <span className="text-primary">Low-Impact Travel</span> <br className="hidden sm:inline" />
              with Kelana
            </motion.h1>

            <motion.p variants={itemVariants} className="mb-8 max-w-md text-lg text-white/90 md:text-xl">
              Create personalized travel experiences that respect local communities and minimize environmental impact,
              powered by AI assistance.
            </motion.p>

            <motion.div variants={itemVariants} className="mb-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="rounded-full px-8 text-base shadow-lg" asChild>
                <Link href="/signup">
                  Start Planning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => setVideoOpen(true)}
              >
                <Play className="mr-2 h-4 w-4" /> Watch How It Works
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex p-2 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-white md:text-base">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column - Visual element */}
          <motion.div
            className="relative hidden md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative h-[500px] w-full">
              <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-primary/20 blur-3xl" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[400px] w-[400px] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                  <Image src="/hero-card.jpg" alt="Eco-friendly travel experience" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className="bg-primary/80 text-white">Eco-Friendly</Badge>
                      <Badge className="bg-white/20 backdrop-blur-sm">Personalized</Badge>
                    </div>
                    <h3 className="mb-1 text-xl font-semibold text-white">Bali Eco Retreat</h3>
                    <p className="text-sm text-white/80">Greener accommodations and local experiences</p>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Leaf className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white">320kg CO₂ saved compared to typical travel</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -left-4 top-1/4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <Leaf className="h-8 w-8 text-primary" />
              </div>

              <div className="absolute -right-2 top-1/3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-md">
                <Globe className="h-6 w-6 text-primary" />
              </div>

              <div className="absolute bottom-1/4 left-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="fill-background"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>

      {/* Video Dialog */}
      <VideoDialog open={videoOpen} onOpenChange={setVideoOpen} />
    </section>
  )
}
