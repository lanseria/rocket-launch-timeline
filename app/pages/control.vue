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

    <div class="max-w-2xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-center mb-6">
        控制面板
      </h1>

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
