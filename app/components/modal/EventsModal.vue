<script setup lang="ts">
const props = defineProps<{
  show: boolean
  timestamps: number[]
  nodeNames: string[]
  nodeVisibilities: boolean[]
}>()

const emit = defineEmits<{
  close: []
  'update:timestamps': [value: number[]]
  'update:nodeNames': [value: string[]]
  'update:nodeVisibilities': [value: boolean[]]
}>()

// 本地编辑状态
const localTimestamps = ref<number[]>([])
const localNodeNames = ref<string[]>([])
const localNodeVisibilities = ref<boolean[]>([])

// 打开时从 props 复制
watch(() => props.show, (show) => {
  if (show) {
    localTimestamps.value = [...props.timestamps]
    localNodeNames.value = [...props.nodeNames]
    localNodeVisibilities.value = [...props.nodeVisibilities]
  }
})

function handleAddNode() {
  localTimestamps.value.push(0)
  localNodeNames.value.push(`新事件 ${localNodeNames.value.length + 1}`)
  localNodeVisibilities.value.push(true)
}

function handleDeleteNode(index: number) {
  if (localTimestamps.value.length <= 1) {
    console.warn('至少需要保留一个事件节点。')
    return
  }
  localTimestamps.value.splice(index, 1)
  localNodeNames.value.splice(index, 1)
  localNodeVisibilities.value.splice(index, 1)
}

function handleClose() {
  emit('update:timestamps', localTimestamps.value)
  emit('update:nodeNames', localNodeNames.value)
  emit('update:nodeVisibilities', localNodeVisibilities.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="bg-black/70 flex items-center inset-0 justify-center fixed z-50 backdrop-blur-sm">
      <div class="exclude-from-screenshot text-white m-4 p-6 border border-gray-700 rounded-lg bg-gray-800 max-w-lg w-full shadow-xl">
        <h2 class="text-xl font-semibold mb-4">
          管理事件节点 (单位: 秒)
        </h2>
        <div class="node_list_scrollbar pr-2 max-h-[40vh] overflow-y-auto">
          <div v-for="(timestamp, i) in localTimestamps" :key="i" class="mb-2 flex gap-3 items-center">
            <label :for="`visible-switch-${i}`" class="inline-flex flex-shrink-0 cursor-pointer items-center relative">
              <input :id="`visible-switch-${i}`" v-model="localNodeVisibilities[i]" type="checkbox" class="peer sr-only">
              <div class="rounded-full bg-gray-600 h-6 w-11 peer-focus:outline-none after:border after:border-gray-300 after:rounded-full after:bg-white peer-checked:bg-green-600 after:h-5 after:w-5 after:content-[''] after:transition-all after:start-[2px] after:top-[2px] after:absolute peer-checked:after:translate-x-full" />
            </label>
            <input v-model.number="localTimestamps[i]" type="number" placeholder="例如: -60" class="input-field flex-shrink w-80px" :aria-label="`事件 ${i + 1} 的时间戳 (秒)`">
            <input v-model="localNodeNames[i]" type="text" placeholder="事件名称" class="input-field flex-grow w-full" :aria-label="`事件 ${i + 1} 的名称`">
            <button class="btn-action bg-red-500 flex-shrink-0 hover:bg-red-600" :disabled="localTimestamps.length <= 1" aria-label="删除事件" @click="handleDeleteNode(i)">
              -
            </button>
          </div>
        </div>
        <button class="btn-action mt-4 bg-green-500 w-full hover:bg-green-600" aria-label="添加新事件" @click="handleAddNode">
          + 添加事件
        </button>
        <button type="button" class="btn-action mt-4 bg-gray-600 w-full hover:bg-gray-700" @click="handleClose">
          关闭
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.input-field {
  --at-apply: 'block rounded-md border border-gray-600 px-3 py-2 shadow-sm sm:text-sm bg-gray-800 text-white focus:border-indigo-400 focus:ring-offset-gray-900';
}

.node_list_scrollbar::-webkit-scrollbar {
  width: 8px;
  -webkit-appearance: none;
}

.node_list_scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgb(107 114 128 / 50%);
  -webkit-box-shadow: 0 0 1px rgb(255 255 255 / 50%);
}
.node_list_scrollbar::-webkit-scrollbar-track {
  background: rgb(31 41 55 / 50%);
  border-radius: 4px;
}
</style>
