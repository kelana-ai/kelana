"use client"

import { HeroBackground, HeroCopy, HeroVisual, HeroWave } from "./hero-parts"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" aria-label="Hero section">
      <HeroBackground />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid min-h-[90vh] items-center py-20 md:grid-cols-2 md:gap-12 lg:min-h-[85vh]">
          <HeroCopy />
          <HeroVisual />
        </div>
      </div>

      <HeroWave />
    </section>
  )
}
