import { notFound } from "next/navigation"

import { createClient } from "@/utils/supabase/server"
import { RefineForm } from "./refine-form"

export const maxDuration = 300

export default async function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: itn } = await supabase.from("itineraries").select("id, name, destination_name").eq("id", id).maybeSingle()
  if (!itn) notFound()

  return <RefineForm id={itn.id} name={itn.name} destination={itn.destination_name} />
}
