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

export async function deleteAccount(email: string, password: string) {
  const base = env("NEXT_PUBLIC_SUPABASE_URL")
  const login = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).catch(() => null)
  if (!login?.ok) return

  const { access_token: token, user } = (await login.json()) as { access_token: string; user: { id: string } }
  const files: { name: string }[] = await fetch(`${base}/storage/v1/object/list/avatars`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ prefix: user.id, limit: 20 }),
  })
    .then((response) => response.json())
    .catch(() => [])
  if (files.length) {
    await fetch(`${base}/storage/v1/object/avatars`, {
      method: "DELETE",
      headers: headers(token),
      body: JSON.stringify({ prefixes: files.map((file) => `${user.id}/${file.name}`) }),
    }).catch(() => undefined)
  }
  await fetch(`${base}/rest/v1/rpc/delete_my_account`, { method: "POST", headers: headers(token), body: "{}" }).catch(() => undefined)
}
