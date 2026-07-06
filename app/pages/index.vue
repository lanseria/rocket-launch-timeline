<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { getTheme } from '~/themes'

const timelineStore = useTimelineStore()
const { missionName, vehicleName, showVehicleName, showConnectionIndicator, timerClock, missionTimeSeconds, currentTimeOffset, visibleEvents, activeThemeId } = storeToRefs(timelineStore)

const activeThemeComponent = computed(() => {
  const theme = getTheme(activeThemeId.value)
  return theme?.component ?? null
})

// WebSocket: 展示端接收同步
const ws = useTimelineWebSocket()

onMounted(() => {
  ws.connect()

  ws.onStateReceived((data) => {
    timelineStore.syncFromRemote(data)
  })

  ws.onClockSyncReceived((data) => {
    timelineStore.applyRemoteClockSync(data)
  })
})

onUnmounted(() => {
  ws.disconnect()
  timelineStore.cleanup()
})
</script>

<template>
  <LayoutAdapter>
    <div class="h-full w-full left-0 top-0 fixed overflow-hidden -z-1">
      <Head>
        <Title>Rocket Launch Timeline</Title>
      </Head>

      <!-- 连接状态指示器 -->
      <div v-if="showConnectionIndicator" class="top-4 right-4 fixed z-50 flex items-center gap-2 text-sm text-white/60">
        <span
          class="inline-block h-2 w-2 rounded-full"
          :class="ws.isConnected.value ? 'bg-green-500' : 'bg-red-500'"
        />
        <span>{{ ws.isConnected.value ? '已连接' : '未连接' }}</span>
      </div>

      <!-- T 计时器 + 任务名称 + 运载工具 -->
      <div class="font-400 font-sans mx-auto text-center max-w-md bottom-16px left-1/2 fixed z-50 -translate-x-1/2">
        <div class="leading-tight relative inline-block tabular-nums">
          <!-- T+/- 相对于时间绝对定位，不挤占时间居中空间 -->
          <div class="text-34px text-stone-100/70 font-500 absolute right-full top-1/2 mr-2 flex -translate-y-1/2 gap-1 items-center whitespace-nowrap">
            <div>T</div><div>{{ timerClock.isPositive ? '+' : '-' }}</div>
          </div>
          <div class="text-44px text-white font-400">
            {{ timerClock.timeString }}
          </div>
        </div>
        <div class="text-16px text-stone-100/70 font-500 uppercase">
          {{ missionName }}<template v-if="showVehicleName"> · {{ vehicleName }}</template>
        </div>
      </div>

      <!-- 时间轴主题组件 -->
      <component
        :is="activeThemeComponent"
        v-if="activeThemeComponent"
        class="bottom-0 left-1/2 fixed z-30 -translate-x-1/2"
        :timestamps="visibleEvents.visibleTimestamps"
        :node-names="visibleEvents.visibleNodeNames"
        :mission-duration="missionTimeSeconds"
        :current-time-offset="currentTimeOffset"
      />

      <GradientBar class="bottom-0 left-0 absolute z-1" />
    </div>
  </LayoutAdapter>
</template>
