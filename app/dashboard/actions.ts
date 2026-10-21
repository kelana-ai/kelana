"use server"

import { createClient } from "@/utils/supabase/server"
import { loadDashboard, type DashboardResult } from "./dashboard"

export async function fetchDashboardData(): Promise<DashboardResult> {
  return loadDashboard(createClient)
}
