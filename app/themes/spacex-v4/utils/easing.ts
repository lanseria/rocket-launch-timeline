export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t
}

export function easeInOutSine(t: number): number {
  const clampedT = Math.max(0, Math.min(1, t))
  return 0.5 * (1 - Math.cos(Math.PI * clampedT))
}

export function easeOutQuart(x: number): number {
  const clampedX = Math.max(0, Math.min(1, x))
  return 1 - (1 - clampedX) ** 4
}

export function easeInOutQuart(x: number): number {
  return x < 0.5 ? 8 * x * x * x * x : 1 - (-2 * x + 2) ** 4 / 2
}
