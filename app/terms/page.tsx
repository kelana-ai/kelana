import type { Metadata } from "next"

import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = { title: "Terms of Service | Kelana" }

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2026">
      <p>By creating an account or using Kelana you agree to these terms. This is a plain-language summary and should be reviewed before commercial use.</p>

      <section>
        <h2>The service</h2>
        <p>Kelana uses AI to suggest travel itineraries with estimated costs and carbon figures. It does not book travel or accommodation.</p>
      </section>

      <section>
        <h2>AI-generated content</h2>
        <p>
          Itineraries may contain mistakes, outdated information or places that have closed. Costs, opening hours, coordinates and carbon figures are estimates. Verify
          everything with the provider before you travel. You use the itineraries at your own risk.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>Keep your login details safe. You are responsible for activity under your account. We may limit how many itineraries can be generated to keep the service available.</p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>Do not misuse the service, attempt to disrupt it, or submit unlawful content.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may update these terms or the service. Continued use after a change means you accept the updated terms.</p>
      </section>
    </LegalPage>
  )
}
