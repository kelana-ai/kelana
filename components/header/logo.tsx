import Image from "next/image"

export function Logo() {
  return <Image src="/logo.png" alt="logo" width={750} height={250} className="h-7 w-auto md:h-8" />
}
