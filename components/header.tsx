"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { DialogTitle } from "@radix-ui/react-dialog"
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, profile, avatarUrl, isLoading } = useUser()

  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup")
  if (isAuthPage) return null

  const isUserLoggedIn = Boolean(user)

  const publicNavigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Sustainability", href: "/#sustainability" },
  ]

  const mobileUserNavigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Itineraries", href: "/my-itineraries" },
    { name: "Account Settings", href: "/account" },
  ]

  const desktopUserNavigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Itineraries", href: "/my-itineraries" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu & Logo Section */}
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-6">
              {/* Mobile Logo */}
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

              {/* Mobile User Info (when available and loaded) */}
              {isUserLoggedIn && profile && !isLoading && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <Avatar className="h-10 w-10 border border-muted">
                    <AvatarImage
                      src={avatarUrl || undefined}
                      alt={profile?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {profile?.full_name ||
                        profile?.username ||
                        user?.email?.split("@")[0] ||
                        ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-4 py-4">
                {(isUserLoggedIn ? mobileUserNavigation : publicNavigation).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth/Signout Buttons */}
              <div className="mt-auto flex flex-col gap-2">
                {isUserLoggedIn ? (
                  <form action="/auth/signout" method="post" className="w-full">
                    <Button variant="destructive" className="w-full" type="submit">
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

          {/* Always-visible Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 lg:flex">
          {(isUserLoggedIn ? desktopUserNavigation : publicNavigation).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop User Dropdown */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {isUserLoggedIn && !isLoading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-muted">
                    <AvatarImage
                      src={avatarUrl || undefined}
                      alt={profile?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[100px] truncate text-sm font-medium">
                    {profile?.full_name || profile?.username || user?.email?.split("@")[0] || ""}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  {user?.email || ""}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/signout" method="post" className="w-full">
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
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
