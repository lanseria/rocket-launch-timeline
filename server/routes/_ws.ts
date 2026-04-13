import type { ClockSyncPayload, StateSnapshot } from '~/types/index'

interface WSMessage {
  type: 'state-sync' | 'clock-sync' | 'request-state'
  payload?: StateSnapshot | ClockSyncPayload
}

let latestState: StateSnapshot | null = null

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
        peer.publish('timeline', data)
      }
      else if (data.type === 'clock-sync') {
        peer.publish('timeline', data)
      }
      else if (data.type === 'request-state') {
        if (latestState) {
          peer.publish('timeline', { type: 'state-sync', payload: latestState } satisfies WSMessage)
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
