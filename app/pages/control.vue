<script setup lang="ts">
import { storeToRefs } from 'pinia'

const timelineStore = useTimelineStore()
const { timestamps, nodeNames, nodeVisibilities } = storeToRefs(timelineStore)

const showEventsModal = ref(false)

// WebSocket: 控制端发送同步
const ws = useTimelineWebSocket()

onMounted(() => {
  ws.connect()

  // 监听 store 变化并发送状态同步
  watch(
    [
      () => timelineStore.missionName,
      () => timelineStore.vehicleName,
      () => timelineStore.backgroundImageUrl,
      () => timelineStore.activeThemeId,
      () => timelineStore.showVehicleName,
      () => timelineStore.showConnectionIndicator,
      () => timelineStore.timestamps,
      () => timelineStore.nodeNames,
      () => timelineStore.nodeVisibilities,
    ],
    () => {
      ws.sendStateSync(timelineStore.getSnapshot())
    },
    { deep: true },
  )

  // 监听时钟同步包并发送
  watch(
    () => timelineStore.lastClockSyncPacket,
    (packet) => {
      if (packet)
        ws.sendClockSync(packet)
    },
  )
})

onUnmounted(() => {
  ws.disconnect()
  timelineStore.cleanup()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <Head>
      <Title>Rocket Launch Timeline - 控制面板</Title>
    </Head>

    <div class="gap-4 mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <!-- 标题栏 -->
      <div class="col-span-full flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold">
          控制面板
        </h1>
        <div class="flex items-center gap-2 text-sm">
          <span
            class="inline-block h-2.5 w-2.5 rounded-full"
            :class="ws.isConnected.value ? 'bg-green-500' : 'bg-red-500'"
          />
          <span class="text-gray-400">
            {{ ws.isConnected.value ? '已连接' : '未连接' }}
          </span>
        </div>
      </div>

      <ControlPanelMainConfig @open-events-modal="showEventsModal = true" />
      <ControlPanelControls />
      <ControlPanelBackgroundConfig />
    </div>

    <!-- 事件管理弹窗 -->
    <ModalEventsModal
      :show="showEventsModal"
      :timestamps="timestamps"
      :node-names="nodeNames"
      :node-visibilities="nodeVisibilities"
      @close="showEventsModal = false"
      @update:timestamps="timestamps = $event"
      @update:node-names="nodeNames = $event"
      @update:node-visibilities="nodeVisibilities = $event"
    />
  </div>
</template>
