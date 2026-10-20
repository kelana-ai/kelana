"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.includes("/login") || pathname?.includes("/signup")) return null

  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Image src="/logo.png" alt="Kelana" width={750} height={250} className="h-7 w-auto self-start md:h-8" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Low-impact trip planning with AI-generated itineraries.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium">Pages</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/itinerary/new" prefetch={false} className="text-muted-foreground hover:text-foreground">
                  Create an Itinerary
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kelana. Itineraries, costs and carbon figures are AI-generated estimates.
          </p>
        </div>
      </div>
    </footer>
  )
}
