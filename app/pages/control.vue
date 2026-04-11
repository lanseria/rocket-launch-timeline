<script setup lang="ts">
import { storeToRefs } from 'pinia'

const timelineStore = useTimelineStore()
const { timestamps, nodeNames, nodeVisibilities } = storeToRefs(timelineStore)

const showEventsModal = ref(false)

function handleAddNode() {
  timelineStore.addNode()
}

function handleDeleteNode(index: number) {
  timelineStore.deleteNode(index)
}

onUnmounted(() => {
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
      @add-node="handleAddNode"
      @delete-node="handleDeleteNode"
      @update:timestamps="timestamps = $event"
      @update:node-names="nodeNames = $event"
      @update:node-visibilities="nodeVisibilities = $event"
    />
  </div>
</template>
