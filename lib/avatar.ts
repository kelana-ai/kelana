export const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
}

export function avatarProblem(file: { type: string; size: number }) {
  if (!Object.hasOwn(AVATAR_EXTENSIONS, file.type)) return "Please choose a PNG, JPEG, WebP or GIF image."
  if (file.size > MAX_AVATAR_BYTES) return "The image must be 2 MB or smaller."
  return null
}

export const avatarPath = (uid: string, type: string, id: string) => `${uid}/${id}.${AVATAR_EXTENSIONS[type]}`

export const ownedAvatar = (path: string | null, uid: string) =>
  path && !path.startsWith("http") && path.startsWith(`${uid}/`) ? path : null
