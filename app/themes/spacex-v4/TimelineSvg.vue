<script setup lang="ts">
import { useTimelineGeometryV4 } from './composables/useGeometry'
import { useTimelineNodesV4 } from './composables/useNodes'
import { COLOR_FUTURE_STR, COLOR_INNER_ARC_STR, COLOR_PAST_PRESENT_STR } from './constants'
import { drawCircle, drawLine, drawPath, drawText } from './utils/svgDrawing'

const props = defineProps<{
  timestamps: number[]
  nodeNames: string[]
  missionDuration: number
  currentTimeOffset?: number
  svgWidth?: number
  svgHeight?: number
  averageDensityFactor?: number
  pastNodeDensityFactor?: number
  futureNodeDensityFactor?: number
}>()

const maskContentGroupEl = useTemplateRef<SVGGElement>('maskContentGroupEl')
const sharpContentGroupEl = useTemplateRef<SVGGElement>('sharpContentGroupEl')
const blurredContentGroupEl = useTemplateRef<SVGGElement>('blurredContentGroupEl')

const propsRefs = toRefs(props)

const geometry = useTimelineGeometryV4(propsRefs)
const { processedNodes } = useTimelineNodesV4(propsRefs, geometry)

function clearCanvas() {
  const groups = [maskContentGroupEl.value, sharpContentGroupEl.value, blurredContentGroupEl.value]
  for (const group of groups) {
    if (group)
      group.innerHTML = ''
  }
}

function drawStaticElements() {
  const sharpGroup = sharpContentGroupEl.value!
  const blurredGroup = blurredContentGroupEl.value!
  const maskGroup = maskContentGroupEl.value!
  const { circleRadius, circleCenterX, circleCenterY } = geometry

  const innerArcOffset = 32
  const borderArcRadius = circleRadius.value - innerArcOffset

  if (borderArcRadius > 0) {
    const angleSpan = Math.PI / 2
    const startAngle = -Math.PI / 2 - angleSpan / 2
    const endAngle = -Math.PI / 2 + angleSpan / 2
    const blurOffset = 20
    const x1_blur = circleCenterX.value + (borderArcRadius + blurOffset) * Math.cos(startAngle)
    const y1_blur = circleCenterY.value + (borderArcRadius + blurOffset) * Math.sin(startAngle)
    const x2_blur = circleCenterX.value + (borderArcRadius + blurOffset) * Math.cos(endAngle)
    const y2_blur = circleCenterY.value + (borderArcRadius + blurOffset) * Math.sin(endAngle)
    drawPath(blurredGroup, {
      d: `M ${x1_blur} ${y1_blur} A ${borderArcRadius + blurOffset} ${borderArcRadius + blurOffset} 0 0 1 ${x2_blur} ${y2_blur} Z`,
      fill: COLOR_INNER_ARC_STR,
    })

    const x1_border = circleCenterX.value + borderArcRadius * Math.cos(startAngle)
    const y1_border = circleCenterY.value + borderArcRadius * Math.sin(startAngle)
    const x2_border = circleCenterX.value + borderArcRadius * Math.cos(endAngle)
    const y2_border = circleCenterY.value + borderArcRadius * Math.sin(endAngle)
    drawPath(sharpGroup, {
      'd': `M ${x1_border} ${y1_border} A ${borderArcRadius} ${borderArcRadius} 0 0 1 ${x2_border} ${y2_border}`,
      'stroke': 'rgba(168, 168, 168, 0.6)',
      'stroke-width': 1.2,
      'fill': 'none',
    })
  }

  const mainArcY = circleCenterY.value - circleRadius.value
  drawPath(maskGroup, {
    'd': `M ${circleCenterX.value - circleRadius.value} ${circleCenterY.value} A ${circleRadius.value} ${circleRadius.value} 0 0 1 ${circleCenterX.value} ${mainArcY}`,
    'stroke': COLOR_PAST_PRESENT_STR,
    'stroke-width': 3,
    'fill': 'none',
  })
  drawPath(maskGroup, {
    'd': `M ${circleCenterX.value} ${mainArcY} A ${circleRadius.value} ${circleRadius.value} 0 0 1 ${circleCenterX.value + circleRadius.value} ${circleCenterY.value}`,
    'stroke': COLOR_FUTURE_STR,
    'stroke-width': 3,
    'fill': 'none',
  })

  drawLine(maskGroup, {
    'x1': circleCenterX.value,
    'y1': mainArcY - 5,
    'x2': circleCenterX.value,
    'y2': mainArcY + 5,
    'stroke': COLOR_PAST_PRESENT_STR,
    'stroke-width': 2,
  })
}

function drawNode(node: ProcessedNode) {
  const sharpGroup = sharpContentGroupEl.value!
  const maskGroup = maskContentGroupEl.value!

  drawCircle(maskGroup, {
    cx: node.position.cx,
    cy: node.position.cy,
    r: node.outerCircle.radius,
    fill: 'rgba(0, 0, 0, 1)',
  })
  drawCircle(sharpGroup, {
    'cx': node.position.cx,
    'cy': node.position.cy,
    'r': node.outerCircle.radius,
    'fill': 'none',
    'stroke': node.outerCircle.color,
    'stroke-width': 1,
  })
  if (node.innerDot.shouldDraw) {
    drawCircle(sharpGroup, {
      cx: node.position.cx,
      cy: node.position.cy,
      r: node.innerDot.radius,
      fill: node.innerDot.color,
    })
  }
  drawText(sharpGroup, node.text.content, {
    'x': node.text.x,
    'y': node.text.y,
    'fill': 'rgba(255, 255, 255, 1)',
    'font-size': '15px',
    'font-family': 'Saira, Noto Sans SC, sans-serif',
    'font-weight': '500',
    'transform': node.text.transform,
    'text-anchor': node.text.anchor,
    'dominant-baseline': node.text.baseline,
  })
}

function renderTimeline() {
  if (!maskContentGroupEl.value || !sharpContentGroupEl.value || !blurredContentGroupEl.value)
    return

  clearCanvas()
  drawStaticElements()

  for (const node of processedNodes.value) {
    if (node.isVisible) {
      drawNode(node)
    }
  }
}

onMounted(renderTimeline)
watch(processedNodes, renderTimeline, { deep: true })
</script>

<template>
  <div class="flex w-full bottom-0 justify-center absolute overflow-hidden">
    <svg class="w-full" :width="geometry.effectiveSvgWidth.value" :height="geometry.effectiveSvgHeight.value">
      <defs>
        <linearGradient id="fade-gradient-v4">
          <stop offset="25%" stop-color="black" />
          <stop offset="35%" stop-color="white" />
          <stop offset="65%" stop-color="white" />
          <stop offset="75%" stop-color="black" />
        </linearGradient>
        <mask id="fixed-fade-mask-v4">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#fade-gradient-v4)" />
        </mask>

        <filter id="blurMe-v4" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceGraphic" stdDeviation="28" />
        </filter>
        <mask id="timeline-mask-v4">
          <g ref="maskContentGroupEl" />
        </mask>
      </defs>
      <g ref="blurredContentGroupEl" filter="url(#blurMe-v4)" />
      <g mask="url(#fixed-fade-mask-v4)">
        <rect x="0" y="0" :width="geometry.effectiveSvgWidth.value" :height="geometry.effectiveSvgHeight.value" fill="rgba(255, 255, 255, 1)" mask="url(#timeline-mask-v4)" />
        <g ref="sharpContentGroupEl" />
      </g>
    </svg>
  </div>
</template>
