export function nextProgress(previous: number) {
  const increment = previous < 70 ? 1.5 : previous < 90 ? 0.7 : 0.3
  return Math.min(99, previous + increment)
}

export const nextIndex = (index: number, length: number) => (index + 1) % length
