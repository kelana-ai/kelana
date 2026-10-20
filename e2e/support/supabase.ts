import type { Page } from "@playwright/test"

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be set to run the end-to-end tests`)
  return value
}

const headers = (token: string) => ({
  apikey: env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  authorization: `Bearer ${token}`,
  "content-type": "application/json",
})

export async function currentSession(page: Page) {
  const cookies = (await page.context().cookies())
    .filter((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name))
  let raw = decodeURIComponent(cookies.map((c) => c.value).join(""))
  if (raw.startsWith("base64-")) raw = Buffer.from(raw.slice(7), "base64").toString()

  const token: string = JSON.parse(raw).access_token
  const userId: string = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub
  return { token, userId }
}

export async function listAvatars(page: Page) {
  const { token, userId } = await currentSession(page)
  const response = await fetch(`${env("NEXT_PUBLIC_SUPABASE_URL")}/storage/v1/object/list/avatars`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ prefix: userId, limit: 20 }),
  })
  if (!response.ok) throw new Error(`listing avatars failed with ${response.status}`)
  return ((await response.json()) as { name: string }[]).map((object) => object.name)
}

export async function deleteAccount(page: Page) {
  const session = await currentSession(page).catch(() => null)
  if (!session) return
  await fetch(`${env("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1/rpc/delete_my_account`, {
    method: "POST",
    headers: headers(session.token),
    body: "{}",
  }).catch(() => undefined)
}
