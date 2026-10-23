import type { Metadata } from "next"

import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = { title: "Privacy Policy | Kelana" }

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>This page explains what Kelana collects when you use the app and how it is used. It is a plain-language summary and should be reviewed before commercial use.</p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account data: your email address and password (stored hashed by our authentication provider).</li>
          <li>Profile data you choose to add: name, username, website, avatar, home location, travel interests and dietary needs.</li>
          <li>Trip data: destinations, dates, budgets, travel preferences and the itineraries generated for you.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your data to sign you in, pre-fill the itinerary form and to generate, store and display your itineraries. Your itineraries are private to your
          account.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <ul>
          <li>Supabase hosts the database, authentication and file storage.</li>
          <li>OpenAI receives the trip details you submit (destination, dates, preferences, budget) to generate or refine an itinerary.</li>
          <li>OpenStreetMap (Nominatim and map tiles) receives the places you search for and the map areas you view, directly from your browser.</li>
          <li>Vercel hosts the app and counts page views and page load times. It sets no cookies and collects no personal data for this.</li>
        </ul>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can edit your profile and preferences in Account Settings, delete individual itineraries from My Itineraries, and permanently delete your account and all
          associated data from Account Settings &rarr; Account &rarr; Danger Zone.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>Kelana uses only the cookies required to keep you signed in. We do not use advertising or analytics cookies.</p>
      </section>
    </LegalPage>
  )
}
