import Link from "next/link"

import { Button } from "@/components/ui/button"

export function AuthButtons() {
  return (
    <>
      <Button asChild variant="ghost">
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </>
  )
}
