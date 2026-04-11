import { easeInOutQuart, lerp } from './easing'

export function createTimeMapFunction(
  currentTime: number,
  avgScale: number,
  pastScale: number,
  futureScale: number,
): (time: number) => number {
  const animationStartTime = -7.8
  const animationDuration = 4
  const animationEndTime = animationStartTime + animationDuration

  let animatedPastScale: number
  let animatedFutureScale: number

  if (currentTime < animationStartTime) {
    animatedPastScale = avgScale
    animatedFutureScale = avgScale
  }
  else if (currentTime >= animationEndTime) {
    animatedPastScale = pastScale
    animatedFutureScale = futureScale
  }
  else {
    const easedProgress = easeInOutQuart((currentTime - animationStartTime) / animationDuration)
    animatedPastScale = lerp(avgScale, pastScale, easedProgress)
    animatedFutureScale = lerp(avgScale, futureScale, easedProgress)
  }

  return function mapTime(time: number): number {
    if (time <= 0)
      return time * animatedPastScale
    else
      return time * animatedFutureScale
  }
}
