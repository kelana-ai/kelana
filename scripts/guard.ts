export const PRODUCTION_SUPABASE_REF = "caeawmpnhnipzknsllce"

export function assertNotProduction(url: string | undefined) {
  if (url?.includes(PRODUCTION_SUPABASE_REF)) throw new Error("Refusing to run against the production database")
}
