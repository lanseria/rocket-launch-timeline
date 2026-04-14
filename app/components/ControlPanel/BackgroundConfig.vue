<script setup lang="ts">
const timelineStore = useTimelineStore()

const { files: selectedBackgroundFiles, open: openBackgroundFileDialog } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})
const currentBackgroundFile = computed(() => selectedBackgroundFiles.value?.[0] || null)

watch(currentBackgroundFile, (file) => {
  if (timelineStore.backgroundImageUrl?.startsWith('blob:'))
    URL.revokeObjectURL(timelineStore.backgroundImageUrl)

  if (file)
    timelineStore.backgroundImageUrl = URL.createObjectURL(file)
})

const isObsMode = computed(() => !timelineStore.backgroundImageUrl)
const isCustomBg = computed(() => timelineStore.backgroundImageUrl?.startsWith('blob:'))
</script>

<template>
  <div class="exclude-from-screenshot p-5 border border-gray-700 rounded-lg bg-gray-800/80 flex flex-col space-y-4">
    <h2 class="text-lg font-semibold">
      背景图
    </h2>

    <!-- 当前状态 -->
    <div class="text-sm text-gray-400 py-1.5 px-3 bg-gray-900/80 rounded-md border border-gray-600">
      <template v-if="isObsMode">
        <span class="text-green-400">OBS 透明模式</span> - 背景已清空
      </template>
      <template v-else-if="isCustomBg">
        <span class="text-blue-400">自定义背景</span> - 本地文件预览
      </template>
      <template v-else>
        <span class="text-gray-300">默认背景</span>
      </template>
    </div>

    <!-- 操作按钮 -->
    <button class="btn-action bg-blue-600 w-full hover:bg-blue-700" @click="openBackgroundFileDialog()">
      选择本地图片
    </button>
    <button
      class="btn-action w-full"
      :class="isObsMode ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'"
      :disabled="isObsMode"
      @click="timelineStore.obsBackgroundImage()"
    >
      OBS 直播透明背景
    </button>
    <button
      class="btn-action w-full"
      :class="(!isCustomBg && !isObsMode) ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-slate-500 hover:bg-slate-600'"
      :disabled="!isCustomBg && !isObsMode"
      @click="timelineStore.restoreBackgroundImage()"
    >
      还原默认背景
    </button>

    <small v-if="currentBackgroundFile" class="text-xs text-gray-400">
      当前预览: {{ currentBackgroundFile.name }}
    </small>
  </div>
</template>
