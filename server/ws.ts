import { defineWebSocketHandler } from 'nitro'

let latestState: any = null

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('timeline')
    // 新客户端连接时发送当前状态
    if (latestState) {
      peer.send(JSON.stringify({ type: 'state-sync', payload: latestState }))
    }
  },
  message(peer, message) {
    try {
      const data = JSON.parse(message.text())

      if (data.type === 'state-sync') {
        latestState = data.payload
        peer.publish('timeline', message.text())
      }
      else if (data.type === 'clock-sync') {
        peer.publish('timeline', message.text())
      }
      else if (data.type === 'theme-change') {
        peer.publish('timeline', message.text())
      }
      else if (data.type === 'request-state') {
        if (latestState) {
          peer.publish('timeline', JSON.stringify({ type: 'state-sync', payload: latestState }))
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
