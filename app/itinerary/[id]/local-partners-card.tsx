"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

interface LocalPartnersCardProps {
  destination: string
}

export function LocalPartnersCard({ destination }: LocalPartnersCardProps) {
  const partners = [
    { name: "Bambu Indah Eco Resort", desc: "Sustainable Accommodation" },
    { name: "Alchemy Bali", desc: "Organic Restaurant" },
    { name: "Bali Eco Tours", desc: "Local Tour Operator" },
  ]

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg overflow-visible my-4 pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-primary" />
          Local Partners
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-visible">
        <div className="space-y-3">
          {partners.map((p, index) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button variant="link" className="px-0 text-primary">
          View all local partners
        </Button>
      </CardFooter>
    </Card>
  )
}
