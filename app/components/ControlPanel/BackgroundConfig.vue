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
</script>

<template>
  <div class="exclude-from-screenshot p-6 border border-gray-200 rounded-lg bg-black/50 max-w-full">
    <h2 class="text-lg font-semibold mb-2">
      页面背景图
    </h2>
    <div class="flex space-x-2">
      <button class="btn-action bg-blue-600 hover:bg-blue-700" @click="openBackgroundFileDialog()">
        选择本地图片
      </button>
      <button class="btn-action bg-green-600 hover:bg-green-700" @click="timelineStore.obsBackgroundImage()">
        obs直播
      </button>
      <button class="btn-action bg-gray-600 hover:bg-gray-700" @click="timelineStore.restoreBackgroundImage()">
        还原背景
      </button>
    </div>
    <small v-if="currentBackgroundFile" class="text-xs text-gray-400 mt-1 block">
      当前预览: {{ currentBackgroundFile.name }} (本地文件不会被保存)
    </small>
    <small v-else-if="timelineStore.backgroundImageUrl?.startsWith('blob:')" class="text-xs text-gray-400 mt-1 block">
      当前为本地预览背景 (不会被保存)
    </small>
  </div>
</template>
