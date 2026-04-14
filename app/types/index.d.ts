// --- 颜色工具类型 ---
interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

// --- 时间轴节点（内部处理用） ---
interface Position {
  cx: number
  cy: number
}

interface ProcessedNode {
  key: string
  name: string
  isVisible: boolean
  position: Position
  outerCircle: { color: string, radius: number }
  innerDot: { color: string, radius: number, shouldDraw: boolean }
  text: {
    content: string
    x: number
    y: number
    transform: string
    anchor: string
    baseline: string
  }
}

// --- 事件类型 ---
interface TimelineEvent {
  time: number
  name: string
  show: boolean
}

// --- 显示信息 ---
interface DisplayInfo {
  title: string
  line: string
}

// --- WebSocket 消息类型 ---
interface WSMessage {
  type: 'state-sync' | 'clock-sync' | 'theme-change' | 'request-state'
  payload: any
}

interface StateSnapshot {
  missionName: string
  vehicleName: string
  timestamps: number[]
  nodeNames: string[]
  nodeVisibilities: boolean[]
  backgroundImageUrl: string
  activeThemeId: string
  showVehicleName: boolean
  showConnectionIndicator: boolean
}

interface ClockSyncPayload {
  action: 'sync' | 'start' | 'pause' | 'resume' | 'seek' | 'reset'
  missionTime: number
  sentAt: number
  isStarted: boolean
  isPaused: boolean
}
