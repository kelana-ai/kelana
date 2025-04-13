import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Bike, Globe, Leaf, Plane, Recycle, Sparkles, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Scenic mountain landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="container relative z-10 flex min-h-[80vh] flex-col items-center justify-center text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">Eco-Conscious Travel Planning</Badge>
          <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Plan Meaningful, Low-Impact Travel with Kelana
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            Create personalized travel experiences that respect local communities and minimize environmental impact,
            powered by AI assistance and sustainable recommendations.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">Explore How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Features</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover how Kelana helps you create meaningful travel experiences while minimizing your environmental
            footprint.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Itinerary Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create personalized travel plans based on your preferences, with AI that suggests eco-friendly options
                and local experiences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Sustainable Stays & Experiences</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover accommodations and activities that prioritize sustainability, support local communities, and
                minimize environmental impact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Recycle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Budget & Carbon Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your travel budget alongside your carbon footprint, with suggestions for reducing both without
                compromising experiences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to create your perfect eco-conscious travel experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Share Your Preferences</h3>
              <p className="text-muted-foreground">
                Tell us about your travel style, interests, budget, and sustainability priorities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get AI Recommendations</h3>
              <p className="text-muted-foreground">
                Our AI generates a personalized itinerary with eco-friendly options and local experiences.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Refine & Explore</h3>
              <p className="text-muted-foreground">
                Fine-tune your itinerary with our AI assistant, then book and enjoy your sustainable adventure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">What Travelers Say</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hear from eco-conscious travelers who have planned their journeys with Kelana.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src="/definda.jpg"
                  alt="definda"
                  width={500}
                  height={500}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium">Definda</p>
                  <p className="text-sm text-muted-foreground">Solo Traveler</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Kelana helped me discover hidden eco-lodges and local experiences I would have never found on my own.
                My trip to Costa Rica was both meaningful and low-impact."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src="/olif.jpg"
                  alt="olif"
                  width={500}
                  height={500}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium">Olif</p>
                  <p className="text-sm text-muted-foreground">Adventure Seeker</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I wanted a thrill without the guilt, and Kelana nailed it. From biking through remote trails to kayaking with locals,
                every part of my journey in Vietnam felt connected to nature and culture."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src="/nadya.jpg"
                  alt="nadya"
                  width={500}
                  height={500}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium">Nadya</p>
                  <p className="text-sm text-muted-foreground">Family Traveler</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Traveling with kids usually means compromises, but Kelana crafted an itinerary in Bali that was fun, educational,
                and totally sustainable. My children loved it—and so did we!"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section className="bg-primary/5 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Collective Impact</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Together, Kelana travelers are making a difference for our planet and communities.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">45,000+</p>
              <p className="text-muted-foreground">Tons of CO₂ Avoided</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">12,500+</p>
              <p className="text-muted-foreground">Local Businesses Supported</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bike className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">78%</p>
              <p className="text-muted-foreground">Low-Carbon Transportation</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">$250K+</p>
              <p className="text-muted-foreground">Donated to Conservation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl rounded-xl bg-primary/10 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Join Our Eco-Travel Community</h2>
          <p className="mb-6 text-muted-foreground">
            Subscribe to receive sustainable travel tips, destination guides, and exclusive offers.
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <Input placeholder="Enter your email" type="email" className="flex-1 bg-white" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  )
}
