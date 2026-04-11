import { useThrottleFn } from '@vueuse/core'

export function useTimelineWebSocket() {
  const isConnected = ref(false)
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const stateCallbacks: Array<(data: StateSnapshot) => void> = []
  const clockCallbacks: Array<(data: ClockSyncPayload) => void> = []

  function getWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/_ws`
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))
      return

    try {
      ws = new WebSocket(getWsUrl())

      ws.onopen = () => {
        isConnected.value = true
      }

      ws.onmessage = (event) => {
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
      }

      ws.onclose = () => {
        isConnected.value = false
        scheduleReconnect()
      }

      ws.onerror = () => {
        isConnected.value = false
      }
    }
    catch {
      isConnected.value = false
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer)
      return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, 3000)
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    isConnected.value = false
  }

  const sendStateSync = useThrottleFn((snapshot: StateSnapshot) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'state-sync', payload: snapshot }))
    }
  }, 500)

  function sendClockSync(payload: ClockSyncPayload) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'clock-sync', payload }))
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
    connect,
    disconnect,
    sendStateSync,
    sendClockSync,
    onStateReceived,
    onClockSyncReceived,
  }
}
