import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { desktopUserNavigation, publicNavigation } from "./navigation"

export function DesktopNav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="hidden gap-6 lg:flex">
      {(loggedIn ? desktopUserNavigation : publicNavigation).map((item) => (
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
  )
}
