import type { ToRefs } from 'vue'
import {
  COLOR_FUTURE,
  COLOR_FUTURE_STR,
  COLOR_INNER_DOT_START,
  COLOR_INNER_DOT_START_STR,
  COLOR_PAST_PRESENT,
  COLOR_PAST_PRESENT_STR,
} from '../constants'
import { interpolateColor } from '../utils/color'
import { easeInOutSine } from '../utils/easing'
import { createTimeMapFunction } from '../utils/timeMapping'

interface NodeProps {
  timestamps: number[]
  nodeNames: string[]
  missionDuration: number
  currentTimeOffset?: number
  averageDensityFactor?: number
  pastNodeDensityFactor?: number
  futureNodeDensityFactor?: number
}

interface Geometry {
  circleRadius: number
  circleCenterX: number
  circleCenterY: number
  effectiveSvgHeight: number
  effectiveSvgWidth: number
}

const NODE_RADIUS = 7
const INNER_DOT_RADIUS = 3
const TEXT_OFFSET_FROM_NODE_EDGE = 0

export function useTimelineNodesV4(
  props: ToRefs<NodeProps>,
  geometry: ToRefs<Geometry>,
) {
  const processedNodes = computed((): ProcessedNode[] => {
    const currentTimelineTime = props.currentTimeOffset?.value ?? 0
    const {
      circleRadius,
      circleCenterX,
      circleCenterY,
      effectiveSvgHeight,
      effectiveSvgWidth,
    } = geometry

    const colorTransitionDuration = 1.0
    const transitionStartOffset = colorTransitionDuration / 2
    const transitionEndOffset = -colorTransitionDuration / 2

    const mapTime = createTimeMapFunction(
      currentTimelineTime,
      props.averageDensityFactor?.value ?? 1.6,
      props.pastNodeDensityFactor?.value ?? 2.4,
      props.futureNodeDensityFactor?.value ?? 2.4,
    )

    return props.timestamps.value
      .map((timestamp, i) => ({
        timestamp,
        name: props.nodeNames.value[i] || `Event ${i + 1}`,
        originalIndex: i,
      }))
      .map((event) => {
        const { timestamp, name, originalIndex } = event

        const mappedTimestamp = mapTime(timestamp)
        const mappedCurrentTime = mapTime(currentTimelineTime)
        const virtualTimeRelativeToNow = mappedTimestamp - mappedCurrentTime

        const halfReferencePathLength = effectiveSvgWidth.value / 2
        const halfMissionDuration = props.missionDuration.value / 2

        const targetArcLengthOffset = (virtualTimeRelativeToNow / halfMissionDuration) * halfReferencePathLength
        const angularOffset = targetArcLengthOffset / (circleRadius.value + 1e-9)
        const angleRad = angularOffset - (Math.PI / 2)

        const cx = circleCenterX.value + circleRadius.value * Math.cos(angleRad)
        const cy = circleCenterY.value + circleRadius.value * Math.sin(angleRad)

        const timeRelativeToNow = timestamp - currentTimelineTime
        let nodeColor: string, innerDotColor: string
        const shouldDrawInnerDot = timeRelativeToNow <= transitionStartOffset
        if (timeRelativeToNow <= transitionStartOffset && timeRelativeToNow >= transitionEndOffset) {
          const easedProgress = easeInOutSine((transitionStartOffset - timeRelativeToNow) / colorTransitionDuration)
          nodeColor = interpolateColor(COLOR_FUTURE, COLOR_PAST_PRESENT, easedProgress)
          innerDotColor = interpolateColor(COLOR_INNER_DOT_START, COLOR_PAST_PRESENT, easedProgress)
        }
        else {
          nodeColor = (timeRelativeToNow > 0) ? COLOR_FUTURE_STR : COLOR_PAST_PRESENT_STR
          innerDotColor = (timeRelativeToNow > 0) ? COLOR_INNER_DOT_START_STR : COLOR_PAST_PRESENT_STR
        }

        const eventName = name
        const isOutsideText = originalIndex % 2 === 1
        const textDirection = isOutsideText ? 1 : -1
        const totalTextOffset = NODE_RADIUS + TEXT_OFFSET_FROM_NODE_EDGE
        const textX = cx + textDirection * totalTextOffset * Math.cos(angleRad)
        const textY = cy + textDirection * totalTextOffset * Math.sin(angleRad)
        const textRotationDeg = angleRad * (180 / Math.PI) + 90

        return {
          key: `${timestamp}-${eventName}`,
          name: eventName,
          isVisible: cy >= -NODE_RADIUS && cy <= effectiveSvgHeight.value + NODE_RADIUS,
          position: { cx, cy },
          outerCircle: { color: nodeColor, radius: NODE_RADIUS },
          innerDot: { color: innerDotColor, radius: INNER_DOT_RADIUS, shouldDraw: shouldDrawInnerDot },
          text: {
            content: eventName,
            x: textX,
            y: textY,
            transform: `rotate(${textRotationDeg}, ${textX}, ${textY})`,
            anchor: 'middle',
            baseline: isOutsideText ? 'text-after-edge' : 'text-before-edge',
          },
        }
      })
  })

  return { processedNodes }
}
