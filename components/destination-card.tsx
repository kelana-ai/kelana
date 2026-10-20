"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface DestinationCardProps {
  name: string
  image: string
  description: string
}

export function DestinationCard({ name, image, description }: DestinationCardProps) {
  return (
    <Card className="group overflow-hidden">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-semibold text-white">{name}</h3>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{description}</span>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/itinerary/new?destination=${encodeURIComponent(name)}`}>Plan a trip here</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
