"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup")
  const isLoggedIn =
    pathname?.includes("/dashboard") || pathname?.includes("/itinerary") || pathname?.includes("/ai-refine")

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Sustainability", href: "/#sustainability" },
  ]

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Itineraries", href: "/dashboard" },
    { name: "Profile", href: "/profile" },
  ]

  // Don't show header on auth pages
  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-6">
              <DialogTitle className="text-xl font-bold mb-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={500}
                    height={500}
                    className="w-20 md:w-24"
                  />
                </div>
              </DialogTitle>
              <nav className="flex flex-col gap-4 py-4">
                {(isLoggedIn ? userNavigation : navigation).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                {isLoggedIn ? (
                  <form action="/auth/signout" method="post">
                    <Button variant="destructive" asChild type="submit">
                      Sign out
                    </Button>
                  </form>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="logo"
              width={500}
              height={500}
              className="w-20 md:w-24"
            />
          </Link>
        </div>

        <nav className="hidden gap-6 lg:flex">
          {(isLoggedIn ? userNavigation : navigation).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {isLoggedIn ? (
            <form action="/auth/signout" method="post">
              <Button variant="outline" asChild type="submit">
                Sign out
              </Button>
            </form>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
