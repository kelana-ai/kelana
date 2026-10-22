"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useUser } from "@/contexts/user-context"
import { AuthButtons } from "./auth-buttons"
import { DesktopNav } from "./desktop-nav"
import { Logo } from "./logo"
import { MobileMenu } from "./mobile-menu"
import { UserMenu } from "./user-menu"

export default function Header() {
  const pathname = usePathname()
  const { user, isLoading } = useUser()

  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup")
  if (isAuthPage) return null

  const isUserLoggedIn = Boolean(user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <DesktopNav loggedIn={isUserLoggedIn} />

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {isLoading ? <div className="h-9 w-40" aria-hidden /> : isUserLoggedIn ? <UserMenu /> : <AuthButtons />}
        </div>
      </div>
    </header>
  )
}
