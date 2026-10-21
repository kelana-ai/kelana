const [year, month, day] = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).split("-").map(Number)

const plusDays = (n: number) => new Date(Date.UTC(year, month - 1, day + n, 12))
const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" })

// the wizard's default range ends on today + 7, so that day is the first one picked
export const tripStart = plusDays(7)
export const tripEnd = plusDays(9)
export const TRIP_DAYS = 3

export const shortDate = (date: Date) => format(date, { month: "short", day: "numeric", year: "numeric" })
export const monthDay = (date: Date) => format(date, { month: "short", day: "numeric" })
export const jakartaDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Jakarta" })
export const longMonth = (date: Date) => format(date, { month: "long" })
export const dayOfMonth = (date: Date) => date.getUTCDate()
