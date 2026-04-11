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
  <div class="exclude-from-screenshot p-6 border border-gray-200 rounded-lg bg-black/50 flex-1 max-w-full">
    <h2 class="text-lg font-semibold mb-2">
      控制
    </h2>
    <button
      class="btn-action mb-2 w-full"
      :class="{
        'bg-blue-500 hover:bg-blue-600': !timelineStore.isStarted,
        'bg-yellow-500 hover:bg-yellow-600': timelineStore.isStarted && !timelineStore.isPaused,
        'bg-green-500 hover:bg-green-600': timelineStore.isStarted && timelineStore.isPaused,
      }"
      @click="timelineStore.toggleLaunch()"
    >
      {{ controlButtonText }}
    </button>
    <button
      class="btn-action mt-2 bg-red-500 w-full hover:bg-red-600"
      :disabled="!timelineStore.isStarted && timelineStore.currentTimeOffset === timelineStore.initialCountdownOffset"
      aria-label="重置计时器"
      @click="timelineStore.resetTimer()"
    >
      重置计时器
    </button>
    <h2 class="text-lg font-semibold mb-2 mt-2">
      快速跳转 (秒)
    </h2>
    <div class="flex items-center space-x-2">
      <input
        ref="jumpInputRef"
        v-model="timelineStore.jumpTargetTimeRaw"
        placeholder="例如: -12" type="number" class="input-field flex-grow" @keyup.enter="submitJump()"
      >
      <button
        class="btn-action bg-indigo-500 hover:bg-indigo-600"
        aria-label="跳转到指定时间"
        @click="submitJump()"
      >
        跳转
      </button>
    </div>
    <small class="text-xs text-gray-400 mt-1 block">
      输入秒数 (负数T-, 正数T+)，回车或点击跳转。
    </small>
    <div class="my-4 border-t border-gray-300" />
    <h2 class="text-lg font-semibold mb-2">
      发射倒计时起点 (秒)
    </h2>
    <input
      v-model="timelineStore.timeValueRaw"
      type="number"
      placeholder="例如: 60"
      class="input-field w-full"
      aria-label="发射倒计时秒数 (正数)"
      :disabled="timelineStore.isStarted"
    >
    <small class="text-xs text-gray-400 mt-1 block">
      从T减多少秒开始倒计时。例如60代表 T-60秒。
    </small>
    <div class="mt-4 pt-4 text-center border-t border-gray-600">
      <small class="text-xs text-gray-300">
        快捷键: <kbd class="text-xs font-sans px-1.5 py-0.5 border border-gray-500 rounded bg-gray-700">Space</kbd> 开始/暂停/继续，
        <kbd class="text-xs font-sans px-1.5 py-0.5 border border-gray-500 rounded bg-gray-700">R</kbd> 重置，
        <kbd class="text-xs font-sans px-1.5 py-0.5 border border-gray-500 rounded bg-gray-700">I</kbd> 聚焦跳转输入框。
      </small>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  --at-apply: 'block rounded-md border border-gray-600 px-3 py-2 shadow-sm sm:text-sm bg-gray-800 text-white focus:border-indigo-400 focus:ring-offset-gray-900';
}
</style>
