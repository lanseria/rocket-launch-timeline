export function useTimelineWebSocket() {
  const stateCallbacks: Array<(data: StateSnapshot) => void> = []
  const clockCallbacks: Array<(data: ClockSyncPayload) => void> = []

  const isConnected = ref(false)

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let sendThrottleTimer: ReturnType<typeof setTimeout> | null = null
  let pendingSnapshot: StateSnapshot | null = null
  let stopped = false

  function getWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/_ws`
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN))
      return

    stopped = false
    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      isConnected.value = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.onclose = () => {
      isConnected.value = false
      if (!stopped) {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => {
      // onclose will handle reconnection
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
  }

  function disconnect() {
    stopped = true
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (sendThrottleTimer) {
      clearTimeout(sendThrottleTimer)
      sendThrottleTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    isConnected.value = false
  }

  function flushSend() {
    if (pendingSnapshot && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'state-sync', payload: pendingSnapshot }))
      pendingSnapshot = null
    }
    sendThrottleTimer = null
  }

  function sendStateSync(snapshot: StateSnapshot) {
    pendingSnapshot = snapshot
    if (!ws || ws.readyState !== WebSocket.OPEN)
      return

    if (!sendThrottleTimer) {
      flushSend()
      sendThrottleTimer = setTimeout(flushSend, 500)
    }
  }

  function sendClockSync(payload: ClockSyncPayload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
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
