import type { ToRefs } from 'vue'
import { easeOutQuart, lerp } from '../utils/easing'

interface GeometryProps {
  svgWidth?: number
  svgHeight?: number
  currentTimeOffset?: number
}

export function useTimelineGeometryV4(props: ToRefs<GeometryProps>) {
  const effectiveSvgWidth = computed(() => props.svgWidth?.value || 1920)
  const effectiveSvgHeight = computed(() => props.svgHeight?.value || 200)

  const dynamicGeometry = computed(() => {
    const currentTime = props.currentTimeOffset?.value ?? 0

    const transitionStartTime = 0
    const transitionDuration = 300
    const rawProgress = Math.max(0, (currentTime - transitionStartTime) / transitionDuration)
    const progress = easeOutQuart(Math.min(1, rawProgress))

    const FINAL_RADIUS = effectiveSvgWidth.value / 2
    const exposedArcAngleDeg = 64
    const exposedArcAngleRad = exposedArcAngleDeg * (Math.PI / 180)
    const finalDistCenterToChord = FINAL_RADIUS * Math.cos(exposedArcAngleRad / 2)
    const FINAL_CENTER_Y = effectiveSvgHeight.value + finalDistCenterToChord

    const TOP_ARC_Y_ANCHOR = FINAL_CENTER_Y - FINAL_RADIUS

    const MAX_RADIUS_FOR_LINE = 50000

    const circleRadius = lerp(MAX_RADIUS_FOR_LINE, FINAL_RADIUS, progress)
    const circleCenterY = TOP_ARC_Y_ANCHOR + circleRadius
    const circleCenterX = effectiveSvgWidth.value / 2

    return {
      circleRadius,
      circleCenterX,
      circleCenterY,
    }
  })

  return {
    effectiveSvgWidth,
    effectiveSvgHeight,
    circleRadius: computed(() => dynamicGeometry.value.circleRadius),
    circleCenterX: computed(() => dynamicGeometry.value.circleCenterX),
    circleCenterY: computed(() => dynamicGeometry.value.circleCenterY),
  }
}
