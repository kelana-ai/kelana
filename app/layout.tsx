import Footer from "@/components/footer"
import Header from "@/components/header"
import { UserProvider } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kelana | Eco-Conscious Travel Planning",
  description: "Plan meaningful, low-impact travel experiences with AI assistance and greener recommendations.",
  keywords: "eco travel, greener tourism, green travel, eco-friendly travel, responsible tourism",
  authors: [{ name: "Kelana Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kelana.fly.dev/",
    title: "Kelana | Eco-Conscious Travel Planning",
    description: "Plan meaningful, low-impact travel experiences with AI assistance and greener recommendations.",
    siteName: "Kelana",
    images: [
      {
        url: "https://kelana.fly.dev/kelana-og.png",
        width: 800,
        height: 600,
        alt: "Kelana - Eco-Conscious Travel Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelana | Eco-Conscious Travel Planning",
    description: "Plan meaningful, low-impact travel experiences with AI assistance and greener recommendations.",
    images: ["https://kelana.fly.dev/kelana-og.png"],
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
      </body>
    </html>
  )
}
