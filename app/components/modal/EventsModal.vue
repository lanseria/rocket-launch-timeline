<script setup lang="ts">
const props = defineProps<{
  show: boolean
  timestamps: number[]
  nodeNames: string[]
  nodeVisibilities: boolean[]
}>()

const emit = defineEmits([
  'close',
  'add-node',
  'delete-node',
  'update:timestamps',
  'update:nodeNames',
  'update:nodeVisibilities',
])

const timestampsWritable = computed({
  get: () => props.timestamps,
  set: val => emit('update:timestamps', val),
})

const nodeNamesWritable = computed({
  get: () => props.nodeNames,
  set: val => emit('update:nodeNames', val),
})

const nodeVisibilitiesWritable = computed({
  get: () => props.nodeVisibilities,
  set: val => emit('update:nodeVisibilities', val),
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="bg-black/70 flex items-center inset-0 justify-center fixed z-50 backdrop-blur-sm">
      <div class="exclude-from-screenshot text-white m-4 p-6 border border-gray-700 rounded-lg bg-gray-800 max-w-lg w-full shadow-xl">
        <h2 class="text-xl font-semibold mb-4">
          管理事件节点 (单位: 秒)
        </h2>
        <div class="node_list_scrollbar pr-2 max-h-[40vh] overflow-y-auto">
          <div v-for="(timestamp, i) in timestampsWritable" :key="i" class="mb-2 flex gap-3 items-center">
            <label :for="`visible-switch-${i}`" class="inline-flex flex-shrink-0 cursor-pointer items-center relative">
              <input :id="`visible-switch-${i}`" v-model="nodeVisibilitiesWritable[i]" type="checkbox" class="peer sr-only">
              <div class="rounded-full bg-gray-600 h-6 w-11 peer-focus:outline-none after:border after:border-gray-300 after:rounded-full after:bg-white peer-checked:bg-green-600 after:h-5 after:w-5 after:content-[''] after:transition-all after:start-[2px] after:top-[2px] after:absolute peer-checked:after:translate-x-full" />
            </label>
            <input v-model.number="timestampsWritable[i]" type="number" placeholder="例如: -60" class="input-field flex-shrink w-80px" :aria-label="`事件 ${i + 1} 的时间戳 (秒)`">
            <input v-model="nodeNamesWritable[i]" type="text" placeholder="事件名称" class="input-field flex-grow w-full" :aria-label="`事件 ${i + 1} 的名称`">
            <button class="btn-action bg-red-500 flex-shrink-0 hover:bg-red-600" :disabled="timestamps.length <= 1" aria-label="删除事件" @click="emit('delete-node', i)">
              -
            </button>
          </div>
        </div>
        <button class="btn-action mt-4 bg-green-500 w-full hover:bg-green-600" aria-label="添加新事件" @click="emit('add-node')">
          + 添加事件
        </button>
        <button type="button" class="btn-action mt-4 bg-gray-600 w-full hover:bg-gray-700" @click="emit('close')">
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
