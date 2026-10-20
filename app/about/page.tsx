"use client"

import { ArrowRight, Heart, Leaf, Sparkles, Users } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const teamMembers = [
  {
    name: "Definda Putri Arisna",
    role: "Co-Founder & CEO",
    image: "/team/definda.jpg",
    bio: "Leads vision and strategy, with a passion for greener innovation.",
    linkedin: "https://au.linkedin.com/in/defindaputri",
  },
  {
    name: "Muhammad Fazil Tirtana",
    role: "Co-Founder & CTO",
    image: "/team/fazil.jpg",
    bio: "Builds and scales the tech that powers Kelana's platform.",
    linkedin: "https://id.linkedin.com/in/faziltirtana",
  },
  {
    name: "Naura Olif Mazaya",
    role: "Co-Founder & COO",
    image: "/team/olif.jpg",
    bio: "Oversees operations and partner relations with care and detail.",
    linkedin: "https://hk.linkedin.com/in/naura-olif",
  },
  {
    name: "Nadya Demita Camila",
    role: "Co-Founder & Head of Experience",
    image: "/team/nadya.jpg",
    bio: "Designs user journeys that are seamless, mindful, and impactful.",
    linkedin: "https://id.linkedin.com/in/nadya-demita-camila-0a2123218",
  },
]

const values = [
  {
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: "Lower-impact choices first",
    description: "Plans favour rail and bus over flights, walkable routes, locally owned places and plant-forward food.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Local communities",
    description: "We nudge travellers towards locally owned businesses and community-run experiences wherever the AI can identify them.",
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Meaningful experiences",
    description: "Every day mixes culture, nature and food so a trip feels intentional rather than rushed.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Honest estimates",
    description: "Costs and carbon figures are AI-generated estimates and are labelled as such. We would rather be upfront than precise-looking.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container relative z-10">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4">About Kelana</Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Travel planning with a <span className="text-primary">lighter footprint</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Kelana is an AI travel planner that turns a few questions into a day-by-day itinerary built around lower-carbon
                transport, local businesses and sustainable choices, so exploring the world doesn&apos;t come at the expense of its future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Planning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#our-values">Our values</a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto max-w-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src="/about-hero.jpg"
                  alt="Team members discussing greener travel plans"
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 768px) 28rem, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="our-values" className="container py-20">
        <div className="mb-12 text-center">
          <Badge className="mb-4">Our Values</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">What guides the plans we build</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">{value.icon}</div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="our-team" className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <Badge className="mb-4">Our Team</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Meet the <span className="text-primary">Kelana Team</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="mb-4 text-primary">{member.role}</p>
                  <p className="mb-4 text-sm text-muted-foreground">{member.bio}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
