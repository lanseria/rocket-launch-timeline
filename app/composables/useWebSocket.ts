import { useThrottleFn, useWebSocket } from '@vueuse/core'

export function useTimelineWebSocket() {
  const stateCallbacks: Array<(data: StateSnapshot) => void> = []
  const clockCallbacks: Array<(data: ClockSyncPayload) => void> = []

  function getWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/_ws`
  }

  const { status, open, close, send } = useWebSocket(getWsUrl, {
    autoConnect: false,
    reconnect: {
      retries: -1,
      delay: 3000,
    },
    onConnected() {
      isConnected.value = true
    },
    onDisconnected() {
      isConnected.value = false
    },
    onMessage(_ws, event) {
      try {
        const data: WSMessage = JSON.parse(event.data)
        if (data.type === 'state-sync') {
          for (const cb of stateCallbacks)
            cb(data.payload)
        }
        else if (data.type === 'clock-sync') {
          for (const cb of clockCallbacks)
            cb(data.payload)
        }
      }
      catch {
        // 忽略非 JSON 消息
      }
    },
  })

  const isConnected = ref(false)

  const sendStateSync = useThrottleFn((snapshot: StateSnapshot) => {
    if (status.value === 'OPEN') {
      send(JSON.stringify({ type: 'state-sync', payload: snapshot }))
    }
  }, 500)

  function sendClockSync(payload: ClockSyncPayload) {
    if (status.value === 'OPEN') {
      send(JSON.stringify({ type: 'clock-sync', payload }))
    }
  }

  function onStateReceived(callback: (data: StateSnapshot) => void) {
    stateCallbacks.push(callback)
  }

  function onClockSyncReceived(callback: (data: ClockSyncPayload) => void) {
    clockCallbacks.push(callback)
  }

  return {
    isConnected,
    connect: open,
    disconnect: close,
    sendStateSync,
    sendClockSync,
    onStateReceived,
    onClockSyncReceived,
  }
}
