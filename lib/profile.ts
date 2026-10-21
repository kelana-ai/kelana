export const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/

export const USERNAME_MESSAGE = "Username must be 3-30 characters: letters, numbers, dots, dashes or underscores."
export const WEBSITE_MESSAGE = "Website must start with http:// or https://"

export function validateProfile({ username, website }: { username: string; website: string }): string | null {
  const cleanUsername = username.trim()
  if (cleanUsername && !USERNAME_PATTERN.test(cleanUsername)) return USERNAME_MESSAGE

  const cleanWebsite = website.trim()
  if (cleanWebsite && !/^https?:\/\//i.test(cleanWebsite)) return WEBSITE_MESSAGE

  return null
}

export const toggleItem = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
