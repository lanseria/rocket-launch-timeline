import type { ClockSyncPayload, StateSnapshot } from '~/types/index'

interface WSMessage {
  type: 'state-sync' | 'clock-sync' | 'request-state'
  payload?: StateSnapshot | ClockSyncPayload
}

let latestState: StateSnapshot | null = null

function broadcast(peer: { publish: (topic: string, data: string) => void }, data: WSMessage) {
  // crossws v0.3.5 的 publish 有 bug: isBinary 检查原始 data 而非转换后的 dataBuff
  // 导致对象被当作二进制发送，浏览器端 JSON.parse 失败
  // 修复：手动 stringify
  peer.publish('timeline', JSON.stringify(data))
}

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('timeline')
    if (latestState) {
      peer.send({ type: 'state-sync', payload: latestState } satisfies WSMessage)
    }
  },
  message(peer, message) {
    try {
      const data = message.json<WSMessage>()
      if (!data)
        return

      if (data.type === 'state-sync') {
        latestState = data.payload as StateSnapshot
        broadcast(peer, data)
      }
      else if (data.type === 'clock-sync') {
        broadcast(peer, data)
      }
      else if (data.type === 'request-state') {
        if (latestState) {
          broadcast(peer, { type: 'state-sync', payload: latestState } satisfies WSMessage)
        }
      }
    }
    catch {
      // 忽略非 JSON 消息
    }
  },
  close(peer) {
    peer.unsubscribe('timeline')
  },
})
