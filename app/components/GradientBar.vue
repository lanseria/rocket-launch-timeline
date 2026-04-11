<script lang="ts" setup>
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  color?: string
}>(), {
  width: 1920,
  height: 128,
  color: 'black',
})

const gradientId = useId()
const viewBox = computed(() => `0 0 ${props.width} ${props.height}`)
const gradientX = computed(() => props.width / 2)
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        :id="gradientId"
        :x1="gradientX"
        :y1="height"
        :x2="gradientX"
        :y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" :style="{ stopColor: color, stopOpacity: 0.5 }" />
        <stop offset="1" :style="{ stopColor: color, stopOpacity: 0 }" />
      </linearGradient>
    </defs>
    <rect
      x="0"
      y="0"
      :width="width"
      :height="height"
      :fill="`url(#${gradientId})`"
    />
  </svg>
</template>
