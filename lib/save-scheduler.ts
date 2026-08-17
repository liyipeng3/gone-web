'use client'

/**
 * 保存调度器（不依赖 React，可独立单测）
 *
 * 职责边界：
 * - 防抖 / 节流由外层（如 ahooks useRequest 的 debounceWait/maxWait）负责，决定“何时想保存”。
 * - SaveScheduler 负责“如何安全地发出请求并采纳结果”：
 *   1. 同一时刻至多一个 in-flight 请求（串行），避免并发写相互竞争；
 *   2. in-flight 期间到来的多次 schedule 会被合并，只保留最新一次 payload；
 *   3. 每个请求带自增 seq，迟到的旧响应会被丢弃，不覆盖更新的结果（防乱序覆盖）。
 *
 * 这样即便服务端是 last-write-wins（无乐观锁），发出的写请求顺序也严格递增，
 * 且过期响应不会污染 UI 状态与本地快照。
 */

export interface SaveSchedulerCallbacks<T, R> {
  /** 一个请求即将发出时触发（seq 为该请求序号） */
  onStart?: (seq: number, payload: T) => void
  /** 请求成功且未过期时触发（仅最新采纳的结果会回调） */
  onResult?: (result: R, seq: number, payload: T) => void
  /** 请求失败时触发 */
  onError?: (error: unknown, seq: number, payload: T) => void
}

export class SaveScheduler<T, R> {
  private seq = 0
  private inFlight = false
  private pending?: { seq: number, payload: T }
  private lastAppliedSeq = 0

  constructor (
    private readonly save: (payload: T) => Promise<R>,
    private readonly callbacks: SaveSchedulerCallbacks<T, R> = {}
  ) {}

  /**
   * 登记一次待保存内容。若当前无 in-flight 请求则立即开始，
   * 否则仅更新 pending，待当前请求结束后发出最新内容。
   */
  schedule (payload: T): void {
    this.pending = { seq: ++this.seq, payload }
    if (!this.inFlight) {
      void this.drain()
    }
  }

  /** 是否存在尚未发出的待保存内容 */
  hasPending (): boolean {
    return this.pending !== undefined
  }

  /** 是否有请求正在进行中 */
  isSaving (): boolean {
    return this.inFlight
  }

  /**
   * 取出并清空当前 pending 的 payload（用于页面卸载/关闭时的兜底 flush）。
   * 不发起请求，仅返回内容交由调用方（如 sendBeacon）处理。
   */
  flushNow (): T | undefined {
    const payload = this.pending?.payload
    this.pending = undefined
    return payload
  }

  private async drain (): Promise<void> {
    this.inFlight = true
    try {
      while (this.pending) {
        const { seq, payload } = this.pending
        this.pending = undefined

        this.callbacks.onStart?.(seq, payload)
        try {
          const result = await this.save(payload)
          // 过期响应丢弃：只有比已采纳序号更新的响应才生效
          if (seq > this.lastAppliedSeq) {
            this.lastAppliedSeq = seq
            this.callbacks.onResult?.(result, seq, payload)
          }
        } catch (error) {
          this.callbacks.onError?.(error, seq, payload)
        }
      }
    } finally {
      this.inFlight = false
    }
  }
}
