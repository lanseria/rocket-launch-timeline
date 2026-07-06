import { easeInOutQuart, lerp } from './easing'

// --- 可调常量区 ---
// 过渡动画在首个可见事件**本身**被触及时开始（currentTime 到达首事件），
// 持续 DURATION_SECONDS 后进入缩放模式。
const DURATION_SECONDS = 4 // 过渡持续时间（保留原值）
// 预览模式：事件等距铺开的总跨度（秒）。可在控制面板「预览跨度」实时调整，
// 值越大事件越稀疏。默认 1200。
const DEFAULT_OVERVIEW_SPAN_SECONDS = 1200
const PAST_SCALE = 2.4 // 缩放模式：过去侧时间缩放；同时作为预览模式的漂移速率
const FUTURE_SCALE = 2.4 // 缩放模式：未来侧时间缩放

interface ComputeTimelineMappingOptions {
  currentTime: number
  /** 已过滤的可见事件时间戳（保持原始顺序，按索引与节点对应） */
  timestamps: number[]
  durationSeconds?: number
  overviewSpanSeconds?: number
  pastScale?: number
  futureScale?: number
}

export interface TimelineMapping {
  /** 每个事件相对当前时刻的"虚拟时间偏移"，索引与入参 timestamps 一一对应 */
  relativeTimes: number[]
  /** 模式混合进度 [0,1]，0=纯预览，1=纯缩放，供调试/可视化使用 */
  progress: number
}

/**
 * 计算每个事件相对当前时刻的虚拟时间偏移。
 *
 * 两种模式按进度 p 在 [firstEvent, firstEvent+duration] 内用 easeInOutQuart 平滑混合：
 * - 预览模式（p=0，currentTime < firstEvent）：事件以 PAST_SCALE 速率整体匀速漂移，
 *   首事件的轨迹与缩放模式**完全一致**（速率恒定，过渡无突变），其他事件以等距
 *   step 排在首事件之后 → 既保持"等距展示"，又与缩放阶段速度统一。
 * - 缩放模式（p=1，currentTime > firstEvent+duration）：past/future 双尺度映射。
 *
 * 首事件在过渡窗口起点（currentTime=firstEvent）时 relative 恰好为 0（到达弧顶），
 * 过渡期间它平稳离开弧顶进入过去侧，全程速率恒定 = PAST_SCALE。
 */
export function computeTimelineMapping(opts: ComputeTimelineMappingOptions): TimelineMapping {
  const {
    currentTime,
    timestamps,
    durationSeconds = DURATION_SECONDS,
    overviewSpanSeconds = DEFAULT_OVERVIEW_SPAN_SECONDS,
    pastScale = PAST_SCALE,
    futureScale = FUTURE_SCALE,
  } = opts

  if (timestamps.length === 0)
    return { relativeTimes: [], progress: 1 }

  // 动态窗口：以首个可见事件本身为起点
  const firstEvent = Math.min(...timestamps)
  const windowStart = firstEvent
  const rawProgress = (currentTime - windowStart) / durationSeconds
  const progress = easeInOutQuart(Math.max(0, Math.min(1, rawProgress)))

  // 每个事件在升序中的名次（用于等间距铺开）
  const sortedIndices = timestamps
    .map((ts, originalIndex) => ({ ts, originalIndex }))
    .sort((a, b) => a.ts - b.ts)
  const rankByOriginalIndex = new Map<number, number>()
  sortedIndices.forEach((entry, rank) => rankByOriginalIndex.set(entry.originalIndex, rank))

  const N = timestamps.length
  const step = overviewSpanSeconds / N

  // 缩放模式：原 past/future 双尺度标量映射
  const scaledMap = (t: number): number => (t <= 0 ? t * pastScale : t * futureScale)
  const scaledNow = scaledMap(currentTime)

  const relativeTimes = timestamps.map((eventTime, originalIndex) => {
    const rank = rankByOriginalIndex.get(originalIndex)!

    // 预览模式：首事件以 pastScale 匀速漂移（= 缩放模式速率），
    // 其他事件以 step 等距排在首事件之后。
    // 注：(firstEvent - currentTime) 在预览阶段恒为正（currentTime < firstEvent），
    //   首事件 rank=0 → relative = (firstEvent-ct)*pastScale，与缩放轨迹一致。
    const overviewRelative = (firstEvent - currentTime) * pastScale + rank * step

    // 缩放模式：双尺度
    const scaledRelative = scaledMap(eventTime) - scaledNow

    return lerp(overviewRelative, scaledRelative, progress)
  })

  return { relativeTimes, progress }
}
