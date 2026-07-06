/* eslint-disable no-alert */
import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { defaultConfigEN, defaultConfigZH } from '~/constants/defaults'

function parseSeconds(timeValue: string | number): number {
  if (typeof timeValue === 'number')
    return Math.round(timeValue)
  const num = Number.parseInt(timeValue, 10)
  return Number.isNaN(num) ? 0 : num
}

const VIEW_WINDOW_SECONDS = 3600

export const useTimelineStore = defineStore('timeline', () => {
  // --- 1. State ---
  const initialEventTimes = defaultConfigEN.events.map(event => event.time)
  const initialEventNames = defaultConfigEN.events.map(event => event.name)
  const initialEventVisibilities = defaultConfigEN.events.map(event => event.show)

  const defaultCountdownStartSeconds = 300

  const missionName = useLocalStorage<string>('rlt_mission_name', defaultConfigEN.missionName)
  const vehicleName = useLocalStorage<string>('rlt_vehicle_name', defaultConfigEN.vehicle)
  const backgroundImageUrl = useSessionStorage<string>('rlt_persisted_background_image_url', defaultConfigEN.backgroundImageUrl)
  const activeThemeId = useLocalStorage<string>('rlt_active_theme_id', 'spacex-v4')
  const showVehicleName = useLocalStorage<boolean>('rlt_show_vehicle_name', false)
  const showConnectionIndicator = useLocalStorage<boolean>('rlt_show_connection_indicator', true)
  const overviewSpanSeconds = useLocalStorage<number>('rlt_overview_span_seconds', 1200)

  const timestamps = useLocalStorage<number[]>('rlt_timestamps_seconds', initialEventTimes)
  const nodeNames = useLocalStorage<string[]>('rlt_nodenames', initialEventNames)
  const nodeVisibilities = useLocalStorage<boolean[]>('rlt_node_visibilities', initialEventVisibilities)

  const timeValueRaw = ref(defaultCountdownStartSeconds)
  const jumpTargetTimeRaw = ref<string | number>('')
  const isStarted = ref(false)
  const isPaused = ref(false)

  const currentTimeOffset = ref(0)
  const timerClock = ref({
    isPositive: false,
    timeString: '00:00:00',
  })

  const isReceivingRemoteControl = ref(false)
  const lastClockSyncPacket = ref<{
    action: 'sync' | 'start' | 'pause' | 'resume' | 'seek' | 'reset'
    missionTime: number
    sentAt: number
    isStarted: boolean
    isPaused: boolean
  } | null>(null)

  // --- 2. Getters ---
  const isTPlus = computed(() => currentTimeOffset.value >= 0)
  const missionTimeSeconds = computed(() => VIEW_WINDOW_SECONDS)

  const sortedEvents = computed(() => {
    return timestamps.value
      .map((time, index) => ({
        time,
        name: nodeNames.value[index]!,
        show: nodeVisibilities.value[index] ?? true,
      }))
      .sort((a, b) => a.time - b.time)
  })

  const initialCountdownOffset = computed(() => {
    const secs = parseSeconds(timeValueRaw.value)
    return (Number.isNaN(secs) || secs <= 0) ? 0 : -secs
  })

  const visibleEvents = computed(() => {
    const halfWindow = VIEW_WINDOW_SECONDS / 2
    const viewStart = currentTimeOffset.value - halfWindow
    const viewEnd = currentTimeOffset.value + halfWindow

    const visibleTimestamps: number[] = []
    const visibleNodeNames: string[] = []

    timestamps.value.forEach((ts, index) => {
      if (nodeVisibilities.value[index] && ts >= viewStart && ts <= viewEnd) {
        visibleTimestamps.push(ts)
        visibleNodeNames.push(nodeNames.value[index]!)
      }
    })

    return { visibleTimestamps, visibleNodeNames }
  })

  // --- 3. Actions ---
  let timerIntervalId: ReturnType<typeof setInterval> | null = null
  let targetT0TimestampMs: number | null = null

  function addNode() {
    timestamps.value.push(0)
    nodeNames.value.push(`新事件 ${nodeNames.value.length + 1}`)
    nodeVisibilities.value.push(true)
  }

  function deleteNode(index: number) {
    if (timestamps.value.length <= 1) {
      console.warn('至少需要保留一个事件节点。')
      return
    }
    timestamps.value.splice(index, 1)
    nodeNames.value.splice(index, 1)
    nodeVisibilities.value.splice(index, 1)
  }

  function formatTimeForClock(totalSeconds: number) {
    const absValue = Math.abs(totalSeconds)
    let secondsForFormatting: number
    if (totalSeconds < 0)
      secondsForFormatting = Math.ceil(absValue)
    else
      secondsForFormatting = Math.floor(absValue)

    const hours = Math.floor(secondsForFormatting / 3600)
    const minutes = Math.floor((secondsForFormatting % 3600) / 60)
    const seconds = secondsForFormatting % 60

    const fHours = String(hours).padStart(2, '0')
    const fMinutes = String(minutes).padStart(2, '0')
    const fSeconds = String(seconds).padStart(2, '0')
    const isPositive = !(totalSeconds < 0 || Object.is(totalSeconds, -0))

    return { isPositive, timeString: `${fHours}:${fMinutes}:${fSeconds}` }
  }

  function applyMissionTime(totalSeconds: number) {
    currentTimeOffset.value = totalSeconds
    timerClock.value = formatTimeForClock(totalSeconds)
  }

  function getCurrentMissionTime() {
    if (!isStarted.value || isPaused.value || targetT0TimestampMs === null)
      return currentTimeOffset.value
    return (performance.now() - targetT0TimestampMs) / 1000
  }

  function createClockSyncPacket(action: 'sync' | 'start' | 'pause' | 'resume' | 'seek' | 'reset') {
    return {
      action,
      missionTime: getCurrentMissionTime(),
      sentAt: Date.now(),
      isStarted: isStarted.value,
      isPaused: isPaused.value,
    }
  }

  function emitClockSync(action: 'sync' | 'start' | 'pause' | 'resume' | 'seek' | 'reset') {
    lastClockSyncPacket.value = createClockSyncPacket(action)
  }

  function updateTimer() {
    if (isPaused.value || targetT0TimestampMs === null)
      return
    applyMissionTime(getCurrentMissionTime())
  }

  function _stopInternalTimer() {
    if (timerIntervalId) {
      clearInterval(timerIntervalId)
      timerIntervalId = null
    }
  }

  function _startInternalTimer() {
    _stopInternalTimer()
    if (targetT0TimestampMs === null) {
      console.warn('无法启动计时器：未正确设置目标T0时间戳。')
      return
    }
    updateTimer()
    timerIntervalId = setInterval(updateTimer, 50)
  }

  function toggleLaunch() {
    if (!isStarted.value) {
      isStarted.value = true
      isPaused.value = false
      targetT0TimestampMs = performance.now() - (currentTimeOffset.value * 1000)
      _startInternalTimer()
      emitClockSync('start')
    }
    else if (isPaused.value) {
      isPaused.value = false
      targetT0TimestampMs = performance.now() - (currentTimeOffset.value * 1000)
      _startInternalTimer()
      emitClockSync('resume')
    }
    else {
      applyMissionTime(getCurrentMissionTime())
      isPaused.value = true
      _stopInternalTimer()
      targetT0TimestampMs = null
      emitClockSync('pause')
    }
  }

  function resetTimer() {
    _stopInternalTimer()
    isStarted.value = false
    isPaused.value = false
    targetT0TimestampMs = null
    applyMissionTime(initialCountdownOffset.value)
    jumpTargetTimeRaw.value = ''
    emitClockSync('reset')
  }

  function jumpToTime() {
    const targetSeconds = parseSeconds(jumpTargetTimeRaw.value)
    if (Number.isNaN(targetSeconds)) {
      console.warn('无效的跳转时间')
      return
    }
    applyMissionTime(targetSeconds)

    if (isStarted.value && !isPaused.value) {
      _stopInternalTimer()
      targetT0TimestampMs = performance.now() - (targetSeconds * 1000)
      _startInternalTimer()
    }
    else if (isStarted.value && isPaused.value) {
      targetT0TimestampMs = performance.now() - (targetSeconds * 1000)
    }
    else {
      targetT0TimestampMs = null
    }

    emitClockSync('seek')
  }

  function obsBackgroundImage() {
    backgroundImageUrl.value = ''
  }

  function restoreBackgroundImage() {
    if (backgroundImageUrl.value?.startsWith('blob:'))
      URL.revokeObjectURL(backgroundImageUrl.value)
    backgroundImageUrl.value = defaultConfigEN.backgroundImageUrl
  }

  function cleanup() {
    _stopInternalTimer()
    if (backgroundImageUrl.value?.startsWith('blob:'))
      URL.revokeObjectURL(backgroundImageUrl.value)
  }

  function resetToDefaults(lang: 'en' | 'zh') {
    const config = lang === 'en' ? defaultConfigEN : defaultConfigZH
    missionName.value = config.missionName
    vehicleName.value = config.vehicle
    timestamps.value = config.events.map(e => e.time)
    nodeNames.value = config.events.map(e => e.name)
    nodeVisibilities.value = config.events.map(e => e.show)
    resetTimer()
  }

  function exportConfig() {
    const configToExport = {
      version: 1,
      missionName: missionName.value,
      vehicleName: vehicleName.value,
      activeThemeId: activeThemeId.value,
      showVehicleName: showVehicleName.value,
      showConnectionIndicator: showConnectionIndicator.value,
      overviewSpanSeconds: overviewSpanSeconds.value,
      timestamps: timestamps.value,
      nodeNames: nodeNames.value,
      nodeVisibilities: nodeVisibilities.value,
      timeValueRaw: timeValueRaw.value,
    }
    const jsonString = JSON.stringify(configToExport, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rocket-timeline-config-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function importConfig(jsonString: string) {
    try {
      const parsedConfig = JSON.parse(jsonString)

      if (!parsedConfig || typeof parsedConfig !== 'object' || !parsedConfig.timestamps || !parsedConfig.nodeNames) {
        alert('导入失败：文件格式不正确或缺少关键数据。')
        return
      }

      missionName.value = parsedConfig.missionName ?? missionName.value
      vehicleName.value = parsedConfig.vehicleName ?? vehicleName.value
      activeThemeId.value = parsedConfig.activeThemeId ?? activeThemeId.value
      showVehicleName.value = parsedConfig.showVehicleName ?? showVehicleName.value
      showConnectionIndicator.value = parsedConfig.showConnectionIndicator ?? showConnectionIndicator.value
      overviewSpanSeconds.value = parsedConfig.overviewSpanSeconds ?? overviewSpanSeconds.value
      timestamps.value = parsedConfig.timestamps ?? timestamps.value
      nodeNames.value = parsedConfig.nodeNames ?? nodeNames.value
      nodeVisibilities.value = parsedConfig.nodeVisibilities ?? timestamps.value.map(() => true)
      timeValueRaw.value = parsedConfig.timeValueRaw ?? timeValueRaw.value

      alert('配置已成功导入！')
      resetTimer()
    }
    catch (error) {
      console.error('导入配置时出错:', error)
      alert('导入失败：JSON 文件解析错误。')
    }
  }

  function syncFromRemote(state: any) {
    isReceivingRemoteControl.value = true

    if (state.missionName)
      missionName.value = state.missionName
    if (state.vehicleName)
      vehicleName.value = state.vehicleName
    if (state.activeThemeId)
      activeThemeId.value = state.activeThemeId
    if (state.showVehicleName !== undefined)
      showVehicleName.value = state.showVehicleName
    if (state.showConnectionIndicator !== undefined)
      showConnectionIndicator.value = state.showConnectionIndicator
    if (state.overviewSpanSeconds !== undefined)
      overviewSpanSeconds.value = state.overviewSpanSeconds

    if (state.backgroundImageUrl !== undefined && backgroundImageUrl.value !== state.backgroundImageUrl)
      backgroundImageUrl.value = state.backgroundImageUrl

    if (state.timestamps && JSON.stringify(timestamps.value) !== JSON.stringify(state.timestamps))
      timestamps.value = state.timestamps
    if (state.nodeNames && JSON.stringify(nodeNames.value) !== JSON.stringify(state.nodeNames))
      nodeNames.value = state.nodeNames
    if (state.nodeVisibilities && JSON.stringify(nodeVisibilities.value) !== JSON.stringify(state.nodeVisibilities))
      nodeVisibilities.value = state.nodeVisibilities
  }

  function applyRemoteClockSync(packet: {
    missionTime: number
    sentAt: number
    isStarted: boolean
    isPaused: boolean
  }) {
    isReceivingRemoteControl.value = true

    if (!packet.isStarted) {
      _stopInternalTimer()
      isStarted.value = false
      isPaused.value = false
      targetT0TimestampMs = null
      applyMissionTime(packet.missionTime)
      return
    }

    if (packet.isPaused) {
      _stopInternalTimer()
      isStarted.value = true
      isPaused.value = true
      targetT0TimestampMs = null
      applyMissionTime(packet.missionTime)
      return
    }

    const ageMs = Math.max(0, Date.now() - packet.sentAt)
    const syncedMissionTime = packet.missionTime + (ageMs / 1000)

    isStarted.value = true
    isPaused.value = false
    targetT0TimestampMs = performance.now() - (syncedMissionTime * 1000)
    applyMissionTime(syncedMissionTime)
    _startInternalTimer()
  }

  function getSnapshot(): StateSnapshot {
    return {
      missionName: missionName.value,
      vehicleName: vehicleName.value,
      timestamps: timestamps.value,
      nodeNames: nodeNames.value,
      nodeVisibilities: nodeVisibilities.value,
      backgroundImageUrl: backgroundImageUrl.value,
      activeThemeId: activeThemeId.value,
      showVehicleName: showVehicleName.value,
      showConnectionIndicator: showConnectionIndicator.value,
      overviewSpanSeconds: overviewSpanSeconds.value,
    }
  }

  function getClockSyncState(action: 'sync' | 'start' | 'pause' | 'resume' | 'seek' | 'reset' = 'sync') {
    return createClockSyncPacket(action)
  }

  function stopRemoteControl() {
    isReceivingRemoteControl.value = false
    cleanup()
  }

  resetTimer()

  return {
    // State
    missionName,
    vehicleName,
    backgroundImageUrl,
    activeThemeId,
    showVehicleName,
    showConnectionIndicator,
    overviewSpanSeconds,
    timestamps,
    nodeNames,
    nodeVisibilities,
    timeValueRaw,
    timerClock,
    isStarted,
    isPaused,
    currentTimeOffset,
    jumpTargetTimeRaw,
    isReceivingRemoteControl,
    // Getters
    isTPlus,
    missionTimeSeconds,
    initialCountdownOffset,
    sortedEvents,
    visibleEvents,
    lastClockSyncPacket,
    // Actions
    addNode,
    deleteNode,
    toggleLaunch,
    resetTimer,
    jumpToTime,
    obsBackgroundImage,
    restoreBackgroundImage,
    cleanup,
    resetToDefaults,
    exportConfig,
    importConfig,
    syncFromRemote,
    applyRemoteClockSync,
    getSnapshot,
    getClockSyncState,
    stopRemoteControl,
    emitClockSync,
  }
})
