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
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { DialogTitle } from "@radix-ui/react-dialog"
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Header() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

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
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Itineraries", href: "/dashboard" },
  ]

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from("avatars").download(path)
      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log("Error downloading image: ", error)
    }
  }

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session && session.user) {
        setUser(session.user)

        // Fetch user profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", session.user.id)
          .single()

        if (!error && data) {
          setProfile(data)

          // Handle avatar URL
          if (data.avatar_url) {
            if (data.avatar_url.startsWith("http")) {
              // If it's already a full URL, use it directly
              setAvatarUrl(data.avatar_url)
            } else {
              // Otherwise, download from Supabase storage
              await downloadImage(data.avatar_url)
            }
          }
        }
      } else {
        setUser(null)
        setProfile(null)
        setAvatarUrl(null)
      }

      setLoading(false)
    }

    fetchUser()

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch user profile data on auth state change
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", session.user.id)
          .single()

        if (data) {
          setProfile(data)

          // Handle avatar URL
          if (data.avatar_url) {
            if (data.avatar_url.startsWith("http")) {
              // If it's already a full URL, use it directly
              setAvatarUrl(data.avatar_url)
            } else {
              // Otherwise, download from Supabase storage
              await downloadImage(data.avatar_url)
            }
          } else {
            setAvatarUrl(null)
          }
        }
      } else {
        setProfile(null)
        setAvatarUrl(null)
      }
    })

    return () => {
      subscription.subscription?.unsubscribe()
    }
  }, [])

  // Clean up object URLs when component unmounts or avatar changes
  useEffect(() => {
    return () => {
      if (avatarUrl && !avatarUrl.startsWith("http")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

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
                  <Image src="/logo.png" alt="logo" width={500} height={500} className="w-20 md:w-24" />
                </div>
              </DialogTitle>

              {user && profile && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <Avatar className="h-10 w-10 border border-muted">
                    <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {profile?.full_name || profile?.username || user.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4 py-4">
                {(user ? userNavigation : navigation).map((item) => (
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
                {user ? (
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign out
                  </Button>
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
            <Image src="/logo.png" alt="logo" width={500} height={500} className="w-20 md:w-24" />
          </Link>
        </div>

        <nav className="hidden gap-6 lg:flex">
          {(user ? userNavigation : navigation).map((item) => (
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-muted">
                    <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[100px] truncate text-sm font-medium">
                    {profile?.full_name || profile?.username || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">{user.email}</div>
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
                <DropdownMenuItem
                  className="flex cursor-pointer items-center text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
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
