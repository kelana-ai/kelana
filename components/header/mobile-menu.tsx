import { DialogTitle } from "@radix-ui/react-dialog"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUser } from "@/contexts/user-context"
import { displayName } from "@/lib/display-name"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { mobileUserNavigation, publicNavigation } from "./navigation"
import { UserAvatar } from "./user-avatar"

export function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, profile, avatarUrl, isLoading } = useUser()
  const isUserLoggedIn = Boolean(user)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-6">
        <DialogTitle className="text-xl font-bold mb-4">
          <div className="border-b pb-4">
            <Logo />
          </div>
        </DialogTitle>

        {isUserLoggedIn && profile && !isLoading && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <UserAvatar className="h-10 w-10 border border-muted" avatarUrl={avatarUrl} profile={profile} email={user?.email} />
            <div className="flex flex-col">
              <span className="font-medium">{displayName(profile, user?.email)}</span>
              <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-4 py-4">
          {(isUserLoggedIn ? mobileUserNavigation : publicNavigation).map((item) => (
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
  )
}
