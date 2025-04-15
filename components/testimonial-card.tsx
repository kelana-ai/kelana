"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Image from "next/image"

interface TestimonialCardProps {
  name: string
  role: string
  image: string
  content: string
  className?: string
}

export function TestimonialCard({ name, role, image, content, className }: TestimonialCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
      <Card className={cn("h-full overflow-hidden transition-all hover:shadow-md", className)}>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="relative">
            <svg
              className="absolute -left-2 -top-2 h-8 w-8 text-primary/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2z" />
              <path d="M17 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4z" />
            </svg>
            <p className="pl-4 text-muted-foreground">{content}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
