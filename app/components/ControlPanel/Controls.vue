<script setup lang="ts">
import { useActiveElement, useMagicKeys } from '@vueuse/core'

const timelineStore = useTimelineStore()
const jumpInputRef = ref<HTMLInputElement | null>(null)
const activeElement = useActiveElement()

const controlButtonText = computed(() => {
  if (!timelineStore.isStarted)
    return '开始倒计时'
  if (timelineStore.isPaused)
    return '继续'
  return '暂停'
})

function isEditableElement(target: Element | null | undefined) {
  if (!(target instanceof HTMLElement))
    return false

  const tagName = target.tagName
  return target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

const isEditing = computed(() => isEditableElement(activeElement.value))

function focusJumpInput() {
  jumpInputRef.value?.focus()
  jumpInputRef.value?.select()
}

function submitJump() {
  timelineStore.jumpToTime()
  jumpInputRef.value?.blur()
}

const { i, r, space } = useMagicKeys({
  passive: false,
  onEventFired(event) {
    if (event.type !== 'keydown' || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey)
      return

    const key = event.key.toLowerCase()

    if (key === 'i' && !isEditing.value) {
      event.preventDefault()
      return
    }

    if (isEditing.value)
      return

    if (key === ' ' || key === 'spacebar' || key === 'r')
      event.preventDefault()
  },
})

watch(i!, (pressed) => {
  if (pressed && !isEditing.value)
    focusJumpInput()
})

watch(space!, (pressed) => {
  if (pressed && !isEditing.value)
    timelineStore.toggleLaunch()
})

watch(r!, (pressed) => {
  if (pressed && !isEditing.value)
    timelineStore.resetTimer()
})
</script>

<template>
  <div class="exclude-from-screenshot p-5 border border-gray-700 rounded-lg bg-gray-800/80 flex flex-col space-y-4">
    <h2 class="text-lg font-semibold">
      控制
    </h2>

    <!-- 当前时间显示 -->
    <div class="text-center py-2 px-3 bg-gray-900/80 rounded-md border border-gray-600">
      <div class="text-sm text-gray-400">
        当前时间
      </div>
      <div class="font-mono text-2xl tracking-wider">
        <span class="text-gray-400">T{{ timelineStore.timerClock.isPositive ? '+' : '-' }}</span>
        <span class="text-white">{{ timelineStore.timerClock.timeString }}</span>
      </div>
    </div>

    <!-- 开始/暂停/继续 -->
    <button
      class="btn-action w-full"
      :class="{
        'bg-blue-600 hover:bg-blue-700': !timelineStore.isStarted,
        'bg-yellow-600 hover:bg-yellow-700': timelineStore.isStarted && !timelineStore.isPaused,
        'bg-green-600 hover:bg-green-700': timelineStore.isStarted && timelineStore.isPaused,
      }"
      @click="timelineStore.toggleLaunch()"
    >
      {{ controlButtonText }}
    </button>

    <!-- 重置 -->
    <button
      class="btn-action bg-red-600 w-full hover:bg-red-700"
      :disabled="!timelineStore.isStarted && timelineStore.currentTimeOffset === timelineStore.initialCountdownOffset"
      aria-label="重置计时器"
      @click="timelineStore.resetTimer()"
    >
      重置计时器
    </button>

    <div class="border-t border-gray-600" />

    <!-- 快速跳转 -->
    <div>
      <h3 class="text-sm font-semibold text-gray-300 mb-2">
        快速跳转 (秒)
      </h3>
      <div class="flex items-center space-x-2">
        <input
          ref="jumpInputRef"
          v-model="timelineStore.jumpTargetTimeRaw"
          placeholder="例如: -12"
          type="number"
          class="input-field flex-grow"
          @keyup.enter="submitJump()"
        >
        <button
          class="btn-action bg-indigo-600 hover:bg-indigo-700"
          aria-label="跳转到指定时间"
          @click="submitJump()"
        >
          跳转
        </button>
      </div>
      <small class="text-xs text-gray-400 mt-1 block">
        负数T-，正数T+，回车或点击跳转
      </small>
    </div>

    <!-- 倒计时起点 -->
    <div>
      <h3 class="text-sm font-semibold text-gray-300 mb-2">
        倒计时起点 (秒)
      </h3>
      <input
        v-model="timelineStore.timeValueRaw"
        type="number"
        placeholder="例如: 60"
        class="input-field w-full"
        aria-label="发射倒计时秒数"
        :disabled="timelineStore.isStarted"
      >
      <small class="text-xs text-gray-400 mt-1 block">
        从T减多少秒开始，如60代表 T-60秒
      </small>
    </div>

    <div class="border-t border-gray-600" />

    <!-- 快捷键提示 -->
    <div class="text-center">
      <small class="text-xs text-gray-400">
        <kbd class="px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 font-sans text-xs">Space</kbd>
        开始/暂停
        <kbd class="px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 font-sans text-xs ml-2">R</kbd>
        重置
        <kbd class="px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 font-sans text-xs ml-2">I</kbd>
        跳转
      </small>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  --at-apply: 'block rounded-md border border-gray-600 px-3 py-2 shadow-sm sm:text-sm bg-gray-900 text-white focus:border-indigo-400 focus:ring-offset-gray-900';
}
</style>
