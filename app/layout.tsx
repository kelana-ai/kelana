import Footer from "@/components/footer"
import Header from "@/components/header"
import { UserProvider } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const onVercel = Boolean(process.env.VERCEL)

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kelana | Eco-Conscious Travel Planning",
  description: "Plan low-impact trips with AI-generated itineraries, cost estimates and carbon estimates.",
  keywords: "eco travel, greener tourism, green travel, eco-friendly travel, responsible tourism",
  authors: [{ name: "Kelana Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Kelana | Eco-Conscious Travel Planning",
    description: "Plan low-impact trips with AI-generated itineraries, cost estimates and carbon estimates.",
    siteName: "Kelana",
    images: [
      {
        url: "/kelana-og.png",
        width: 800,
        height: 600,
        alt: "Kelana - Eco-Conscious Travel Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelana | Eco-Conscious Travel Planning",
    description: "Plan low-impact trips with AI-generated itineraries, cost estimates and carbon estimates.",
    images: ["/kelana-og.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <UserProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </UserProvider>
        {onVercel && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
