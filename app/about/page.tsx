import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Globe, Heart, Leaf, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Badge className="mb-4">Our Mission</Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Transforming Travel Through Sustainability
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                At Kelana, we're on a mission to make travel more meaningful and less impactful on our planet. We
                believe that exploring the world shouldn't come at the expense of its future.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Join Our Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="/about-hero.jpg"
                alt="Team members discussing sustainable travel plans"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Values</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            The principles that guide everything we do at Kelana
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Environmental Stewardship</h3>
              <p className="text-muted-foreground">
                We prioritize low-carbon options, support conservation efforts, and promote sustainable practices in all
                our travel recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Community Impact</h3>
              <p className="text-muted-foreground">
                We believe travel should benefit local communities through economic opportunities, cultural exchange,
                and social empowerment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Meaningful Experiences</h3>
              <p className="text-muted-foreground">
                We focus on creating transformative travel experiences that foster personal growth, cultural
                understanding, and lasting memories.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Story</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              How Kelana was born from a passion for sustainable travel
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-12">
            <div className="grid gap-8 md:grid-cols-5 md:items-center">
              <div className="md:col-span-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src="/hiking.jpg"
                    alt="Founders hiking in a forest"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <h3 className="mb-2 text-xl font-semibold">The Beginning</h3>
                <p className="text-muted-foreground">
                  Kelana started in 2020 when four friends—Definda, Fazil, Nadya, and Olif—returned from their travels with a
                  shared concern: the environmental impact of tourism and the disconnect between travelers and local
                  communities.
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-5 md:items-center">
              <div className="order-last md:order-first md:col-span-3">
                <h3 className="mb-2 text-xl font-semibold">The Challenge</h3>
                <p className="text-muted-foreground">
                  They saw that while people wanted to travel more sustainably, the tools to plan such trips were
                  fragmented and often unreliable. Planning a truly eco-conscious journey required extensive research
                  and expertise.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src="/working.jpg"
                    alt="Team working on sustainable travel solutions"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-5 md:items-center">
              <div className="md:col-span-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src="/solution.jpg"
                    alt="Kelana platform in action"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <h3 className="mb-2 text-xl font-semibold">The Solution</h3>
                <p className="text-muted-foreground">
                  Combining their backgrounds in technology, environmental science, and tourism, they created Kelana—a
                  platform that uses AI to simplify sustainable travel planning while maximizing positive impact for
                  both travelers and destinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Team</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">The passionate individuals behind Kelana's mission</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
              <Image
                src="/definda.jpg"
                alt="Definda Putri Arisna"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">Definda Putri Arisna</h3>
            <p className="mb-2 text-primary">Co-Founder & CEO</p>
            <p className="text-sm text-muted-foreground">
              Leads vision and strategy, with a passion for sustainable innovation.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
              <Image
                src="/fazil.jpg"
                alt="Muhammad Fazil Tirtana"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">Muhammad Fazil Tirtana</h3>
            <p className="mb-2 text-primary">Co-Founder & CTO</p>
            <p className="text-sm text-muted-foreground">
              Builds and scales the tech that powers Kelana's platform.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
              <Image
                src="/olif.jpg"
                alt="Naura Olif Mazaya"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">Naura Olif Mazaya</h3>
            <p className="mb-2 text-primary">Co-Founder & COO</p>
            <p className="text-sm text-muted-foreground">
              Oversees operations and partner relations with care and detail.
            </p>
          </div>    

          <div className="text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
              <Image
                src="/nadya.jpg"
                alt="Nadya Demita Camila"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">Nadya Demita Camila</h3>
            <p className="mb-2 text-primary">Co-Founder & Head of Experience</p>
            <p className="text-sm text-muted-foreground">
              Designs user journeys that are seamless, mindful, and impactful.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-primary/5 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Impact</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The difference we're making together with our community of travelers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">45,000+</p>
                  <p className="mt-1 text-muted-foreground">Tons of CO₂ Avoided</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">12,500+</p>
                  <p className="mt-1 text-muted-foreground">Local Businesses Supported</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">35,000+</p>
                  <p className="mt-1 text-muted-foreground">Eco-Conscious Travelers</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">$250K+</p>
                  <p className="mt-1 text-muted-foreground">Donated to Conservation</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Join Our Community <Globe className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
