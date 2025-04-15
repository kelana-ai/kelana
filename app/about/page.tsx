"use client"

import { motion, useInView } from "framer-motion"
import { ArrowRight, CheckCircle2, Globe, Heart, Leaf, MapPin, Sparkles, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AboutPage() {
  const missionRef = useRef(null)
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)
  const impactRef = useRef(null)
  const joinRef = useRef(null)

  const missionInView = useInView(missionRef, { once: true, amount: 0.3 })
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 })
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 })
  const teamInView = useInView(teamRef, { once: true, amount: 0.3 })
  const impactInView = useInView(impactRef, { once: true, amount: 0.3 })
  const joinInView = useInView(joinRef, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const teamMembers = [
    {
      name: "Definda Putri Arisna",
      role: "Co-Founder & CEO",
      image: "/team/definda.jpg",
      bio: "Leads vision and strategy, with a passion for greener innovation.",
      socialLinks: {
        linkedin: "https://au.linkedin.com/in/defindaputri",
        twitter: "",
      },
    },
    {
      name: "Muhammad Fazil Tirtana",
      role: "Co-Founder & CTO",
      image: "/team/fazil.jpg",
      bio: "Builds and scales the tech that powers Kelana's platform.",
      socialLinks: {
        linkedin: "https://id.linkedin.com/in/faziltirtana",
        twitter: "",
      },
    },
    {
      name: "Naura Olif Mazaya",
      role: "Co-Founder & COO",
      image: "/team/olif.jpg",
      bio: "Oversees operations and partner relations with care and detail.",
      socialLinks: {
        linkedin: "https://hk.linkedin.com/in/naura-olif",
        twitter: "",
      },
    },
    {
      name: "Nadya Demita Camila",
      role: "Co-Founder & Head of Experience",
      image: "/team/nadya.jpg",
      bio: "Designs user journeys that are seamless, mindful, and impactful.",
      socialLinks: {
        linkedin: "https://id.linkedin.com/in/nadya-demita-camila-0a2123218",
        twitter: "",
      },
    },
  ];  

  const values = [
    {
      icon: <Leaf className="h-6 w-6 text-primary" />,
      title: "Environmental Stewardship",
      description:
        "We prioritize low-carbon options, support conservation efforts, and promote greener practices in all our travel recommendations.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Community Impact",
      description:
        "We believe travel should benefit local communities through economic opportunities, cultural exchange, and social empowerment.",
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Meaningful Experiences",
      description:
        "We focus on creating transformative travel experiences that foster personal growth, cultural understanding, and lasting memories.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Innovation & Accessibility",
      description:
        "We leverage technology to make greener travel planning accessible to everyone, regardless of their travel experience.",
    },
  ]

  // Timeline events
  const timelineEvents = [
    {
      year: "2020",
      title: "The Beginning",
      description:
        "Three friends—Maya, Liam, and Sofia—returned from their travels with a shared concern about tourism's environmental impact and the disconnect between travelers and local communities.",
    },
    {
      year: "2021",
      title: "Research & Development",
      description:
        "The team conducted extensive research on greener tourism practices and began developing the AI algorithms that would power Kelana's recommendations.",
    },
    {
      year: "2022",
      title: "Beta Launch",
      description:
        "Kelana launched in beta with 500 early adopters who helped refine the platform and provided valuable feedback on the user experience.",
    },
    {
      year: "2023",
      title: "Global Expansion",
      description:
        "The platform expanded to include destinations across six continents and partnerships with over 1,000 eco-certified accommodations and experiences.",
    },
    {
      year: "Today",
      title: "Growing Community",
      description:
        "Kelana continues to grow its community of eco-conscious travelers and expand its positive impact on both the environment and local communities worldwide.",
    },
  ]

  // Impact statistics
  const impactStats = [
    {
      value: "45,000+",
      label: "Tons of CO₂ Avoided",
      icon: <Globe className="h-6 w-6 text-primary" />,
    },
    {
      value: "12,500+",
      label: "Local Businesses Supported",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      value: "35,000+",
      label: "Eco-Conscious Travelers",
      icon: <MapPin className="h-6 w-6 text-primary" />,
    },
    {
      value: "$250K+",
      label: "Donated to Conservation",
      icon: <Leaf className="h-6 w-6 text-primary" />,
    },
  ]

  // Certifications and partnerships
  const certifications = [
    "Global Greener Tourism Council",
    "B Corporation Certified",
    "Carbon Neutral Company",
    "1% for the Planet Member",
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container relative z-10">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4">Our Story</Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Transforming Travel Through <span className="text-primary">Sustainability</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                At Kelana, we're on a mission to make travel more meaningful and less impactful on our planet. We
                believe that exploring the world shouldn't come at the expense of its future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="#join-us">
                    Join Our Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#our-story">Learn More</a>
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
                  className="object-cover w-full h-full"
                  sizes=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge variant="outline" className="mb-2 bg-white/10 backdrop-blur-sm text-white">
                    Eco-Conscious Travel
                  </Badge>
                  <p className="text-lg font-medium text-white">Making travel a force for good</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/5" />
            </motion.div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Quick Navigation */}
      <section className="sticky top-16 z-30 border-b bg-background/80 py-4 backdrop-blur-md">
        <div className="container">
          <Tabs defaultValue="mission" className="w-full">
            <TabsList className="mx-auto flex w-full max-w-3xl justify-between overflow-x-auto">
              <TabsTrigger value="mission" asChild>
                <a href="#our-mission">Our Mission</a>
              </TabsTrigger>
              <TabsTrigger value="story" asChild>
                <a href="#our-story">Our Story</a>
              </TabsTrigger>
              <TabsTrigger value="values" asChild>
                <a href="#our-values">Our Values</a>
              </TabsTrigger>
              <TabsTrigger value="team" asChild>
                <a href="#our-team">Our Team</a>
              </TabsTrigger>
              <TabsTrigger value="impact" asChild>
                <a href="#our-impact">Our Impact</a>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Mission Section */}
      <section id="our-mission" ref={missionRef} className="py-20">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-4">Our Mission</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Making Travel a Force for <span className="text-primary">Good</span>
              </h2>
            </motion.div>

            <motion.p variants={itemVariants} className="mb-8 text-lg text-muted-foreground">
              Kelana exists to transform how people travel by making greener, meaningful experiences accessible to
              everyone. We believe that travel has the power to change lives, preserve cultures, and protect our planet
              when done thoughtfully.
            </motion.p>

            <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Eco-Conscious</h3>
                <p className="text-muted-foreground">
                  We prioritize travel options that minimize environmental impact and support conservation.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Community-Focused</h3>
                <p className="text-muted-foreground">
                  We connect travelers with authentic local experiences that benefit communities directly.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Transformative</h3>
                <p className="text-muted-foreground">
                  We create experiences that foster personal growth and cultural understanding.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" ref={storyRef} className="bg-muted/30 py-20">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <Badge className="mb-4">Our Story</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                The Journey of <span className="text-primary">Kelana</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                How we evolved from a shared concern about travel's impact to a platform that's changing how people
                explore the world.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              {/* Timeline line */}
              <div className="absolute left-16 top-0 h-full w-0.5 bg-primary/20 md:left-1/2" />

              {/* Timeline events */}
              <div className="space-y-12">
                {timelineEvents.map((event, index) => (
                  <div
                    key={event.year}
                    className={`relative flex flex-col gap-8 md:flex-row ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Year marker */}
                    <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-white md:left-[calc(50%-24px)]">
                      {event.year.substring(0, 2)}
                    </div>

                    {/* Content */}
                    <div
                      className={`ml-16 md:ml-0 md:w-[calc(50%-32px)] ${
                        index % 2 === 1 ? "md:text-right" : "md:text-left"
                      }`}
                    >
                      <div
                        className={`rounded-lg bg-card p-6 shadow-sm ${
                          index % 2 === 1 ? "md:rounded-r-2xl" : "md:rounded-l-2xl"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline">{event.year}</Badge>
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    <div className="hidden md:block md:w-[calc(50%-32px)]" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section id="our-values" ref={valuesRef} className="py-20">
        <div className="container">
          <motion.div variants={containerVariants} initial="hidden" animate={valuesInView ? "visible" : "hidden"}>
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <Badge className="mb-4">Our Values</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                The Principles That <span className="text-primary">Guide Us</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                These core values shape everything we do at Kelana, from the features we build to the partners we
                choose.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title} className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {value.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mx-auto mt-16 max-w-3xl rounded-2xl bg-primary/5 p-8">
              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Our Commitment</h3>
                  <p className="text-muted-foreground">
                    We're committed to continuous improvement in our sustainability practices. We regularly audit our
                    operations, partners, and recommendations to ensure they align with our values and have the most
                    positive impact possible.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section id="our-team" ref={teamRef} className="bg-muted/30 py-20">
        <div className="container">
          <motion.div variants={containerVariants} initial="hidden" animate={teamInView ? "visible" : "hidden"}>
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <Badge className="mb-4">Our Team</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Meet the <span className="text-primary">Kelana Team</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Our diverse team brings together expertise in sustainability, technology, and travel to create a
                platform that's changing the industry.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <Card key={member.name} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={member.image || "/placeholder.svg"}
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
                    <div className="flex gap-2">
                      {member.socialLinks.linkedin && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-linkedin"
                            >
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect width="4" height="12" x="2" y="9" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      {member.socialLinks.twitter && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-twitter"
                            >
                              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                            <span className="sr-only">Twitter</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 text-center">
              <h3 className="mb-4 text-2xl font-semibold">Join Our Team</h3>
              <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
                We're always looking for passionate individuals who share our values and want to make a difference in
                the travel industry.
              </p>
              <Button size="lg" asChild>
                <Link href="/careers">View Open Positions</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="our-impact" ref={impactRef} className="py-20">
        <div className="container">
          <motion.div variants={containerVariants} initial="hidden" animate={impactInView ? "visible" : "hidden"}>
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <Badge className="mb-4">Our Impact</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Making a <span className="text-primary">Difference</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Together with our community of travelers, we're creating positive change for our planet and communities
                around the world.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {impactStats.map((stat) => (
                <Card key={stat.label} className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {stat.icon}
                    </div>
                    <p className="mb-2 text-3xl font-bold">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-primary/5 p-8">
                <h3 className="mb-4 text-2xl font-semibold">Environmental Impact</h3>
                <p className="mb-6 text-muted-foreground">
                  Through our carbon offset programs, greener transportation recommendations, and partnerships with
                  eco-certified accommodations, we've helped travelers significantly reduce their environmental
                  footprint.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>45,000+ tons of CO₂ emissions avoided</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>78% of recommended transportation is low-carbon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>100% of partner accommodations have sustainability practices</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-primary/5 p-8">
                <h3 className="mb-4 text-2xl font-semibold">Social Impact</h3>
                <p className="mb-6 text-muted-foreground">
                  We prioritize experiences that directly benefit local communities, preserve cultural heritage, and
                  create economic opportunities in the destinations we feature.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>12,500+ local businesses supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>$250,000+ donated to conservation and community projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <span>85% of our experiences are owned or operated by local residents</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16">
              <h3 className="mb-6 text-center text-2xl font-semibold">Certifications & Partnerships</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {certifications.map(
                  (cert) =>
                    (
                      <Badge key={cert} variant="outline" className="text-sm font-medium px-4 py-2">
                    {cert}
                  </Badge>
                    ),
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join-us" ref={joinRef} className="bg-primary/5 py-20">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={joinInView ? "visible" : "hidden"}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-4">Join Our Journey</Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Be Part of the <span className="text-primary">Solution</span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join our community of eco-conscious travelers who are changing the way we explore the world, one trip at
                a time.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create an Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex justify-center gap-6">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/kelanatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://instagram.com/kelanatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-instagram"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://linkedin.com/company/kelanatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-linkedin"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
