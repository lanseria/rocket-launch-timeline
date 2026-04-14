<!-- eslint-disable no-alert -->
<script setup lang="ts">
import { themes } from '~/themes'

const emit = defineEmits(['open-events-modal'])
const timelineStore = useTimelineStore()

const { files, open, reset } = useFileDialog({
  accept: '.json',
  multiple: false,
})

watch(files, (selectedFiles) => {
  const file = selectedFiles?.[0]
  if (!file)
    return
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (typeof content === 'string') {
      timelineStore.importConfig(content)
    }
    else {
      alert('无法读取文件内容。')
    }
    reset()
  }
  reader.onerror = () => {
    alert('读取文件时发生错误。')
    reset()
  }
  reader.readAsText(file)
})
</script>

<template>
  <div class="exclude-from-screenshot p-5 border border-gray-700 rounded-lg bg-gray-800/80 flex flex-col space-y-4">
    <h2 class="text-lg font-semibold">
      主要配置
    </h2>

    <!-- 主题选择 -->
    <div>
      <label class="text-sm text-gray-300 font-medium mb-2 block">UI 主题</label>
      <fieldset class="p-1 rounded-lg bg-gray-700/50 gap-2 grid" :class="`grid-cols-${themes.length}`">
        <div v-for="theme in themes" :key="theme.id">
          <input :id="`theme-${theme.id}`" v-model="timelineStore.activeThemeId" type="radio" :value="theme.id" class="peer sr-only">
          <label :for="`theme-${theme.id}`" class="text-sm text-gray-400 font-medium py-1.5 text-center rounded-md block cursor-pointer transition-colors duration-150 peer-checked:text-white peer-checked:bg-indigo-600">
            {{ theme.name }}
          </label>
        </div>
      </fieldset>
    </div>

    <!-- 任务/运载器名称 -->
    <div>
      <label for="missionNameInput" class="text-sm text-gray-300 font-medium mb-1 block">任务名称</label>
      <input id="missionNameInput" v-model="timelineStore.missionName" type="text" class="input-field w-full" aria-label="任务名称">
    </div>
    <div>
      <label for="vehicleNameInput" class="text-sm text-gray-300 font-medium mb-1 block">运载工具</label>
      <input id="vehicleNameInput" v-model="timelineStore.vehicleName" type="text" class="input-field w-full" aria-label="运载工具名称">
    </div>

    <!-- 显示开关 -->
    <div class="flex items-center justify-between">
      <label for="showVehicleNameSwitch" class="text-sm text-gray-300 font-medium">显示运载工具名称</label>
      <label for="showVehicleNameSwitch" class="inline-flex cursor-pointer items-center relative">
        <input id="showVehicleNameSwitch" v-model="timelineStore.showVehicleName" type="checkbox" class="peer sr-only">
        <div class="rounded-full bg-gray-600 h-6 w-11 peer-focus:outline-none after:border after:border-gray-300 after:rounded-full after:bg-white peer-checked:bg-blue-600 after:h-5 after:w-5 after:content-[''] after:transition-all after:start-[2px] after:top-[2px] after:absolute peer-checked:after:translate-x-full" />
      </label>
    </div>

    <div class="my-1 border-t border-gray-600" />
    <div class="space-y-3">
      <button class="btn-action bg-indigo-600 w-full hover:bg-indigo-700" @click="emit('open-events-modal')">
        管理事件节点
      </button>

      <div class="gap-2 grid grid-cols-2">
        <button class="btn-action text-sm bg-teal-600 flex gap-2 w-full items-center justify-center hover:bg-teal-700" @click="open()">
          <div class="i-carbon-upload" />
          导入配置
        </button>
        <button class="btn-action text-sm bg-sky-600 flex gap-2 w-full items-center justify-center hover:bg-sky-700" @click="timelineStore.exportConfig()">
          <div class="i-carbon-download" />
          导出配置
        </button>
      </div>
      <div class="gap-2 grid grid-cols-2">
        <button class="btn-action text-sm bg-slate-600 w-full hover:bg-slate-700" @click="timelineStore.resetToDefaults('zh')">
          重置为中文默认值
        </button>
        <button class="btn-action text-sm bg-slate-600 w-full hover:bg-slate-700" @click="timelineStore.resetToDefaults('en')">
          重置为英文默认值
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  --at-apply: 'block rounded-md border border-gray-600 px-3 py-2 shadow-sm sm:text-sm bg-gray-900 text-white focus:border-indigo-400 focus:ring-offset-gray-900';
}
</style>
