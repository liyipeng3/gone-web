'use client'

/**
 * 草稿本地快照工具
 *
 * 在自动保存（防抖 + 兜底）之外，额外把当前编辑内容写入 localStorage，
 * 作为浏览器崩溃 / 意外关闭 / 网络异常导致最后一次保存丢失时的兜底恢复来源。
 *
 * 快照仅保存可编辑字段与一个本地时间戳，不含服务端派生字段。
 */

const SNAPSHOT_PREFIX = 'gone-web:draft:'

export interface DraftSnapshot {
  title?: string | null
  slug?: string
  text?: string | null
  category?: string | null
  tags?: string[]
  /** 本地写入时间戳（ms），用于与服务端 updatedAt 比较新旧 */
  savedAt: number
}

/** 可参与快照的内容字段（不含 savedAt） */
export type DraftSnapshotContent = Omit<DraftSnapshot, 'savedAt'>

const getKey = (cid: string | number): string => `${SNAPSHOT_PREFIX}${cid}`

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

/**
 * 写入草稿快照（localStorage 不可用时静默忽略）
 */
export const writeDraftSnapshot = (cid: string | number, content: DraftSnapshotContent): void => {
  if (!isBrowser()) return
  try {
    const snapshot: DraftSnapshot = { ...content, savedAt: Date.now() }
    window.localStorage.setItem(getKey(cid), JSON.stringify(snapshot))
  } catch {
    // 容量超限等异常忽略，快照仅为兜底能力
  }
}

/**
 * 读取草稿快照，不存在或解析失败时返回 null
 */
export const readDraftSnapshot = (cid: string | number): DraftSnapshot | null => {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(getKey(cid))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.savedAt !== 'number') {
      return null
    }
    return parsed as DraftSnapshot
  } catch {
    return null
  }
}

/**
 * 清除草稿快照（保存成功或用户放弃恢复后调用）
 */
export const clearDraftSnapshot = (cid: string | number): void => {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(getKey(cid))
  } catch {
    // 忽略
  }
}

/**
 * 规范化标签用于比较（去空、去重、排序）
 */
export const normalizeTags = (tags?: string[]): string[] =>
  Array.from(new Set((tags ?? []).filter(Boolean))).sort((a, b) => a.localeCompare(b))

/**
 * 判断快照内容与服务端内容是否存在实质差异，
 * 用于决定是否提示用户“检测到未保存内容，是否恢复”。
 */
export const draftContentDiffers = (
  snapshot: DraftSnapshotContent,
  server: DraftSnapshotContent
): boolean => {
  if ((snapshot.title ?? '') !== (server.title ?? '')) return true
  if ((snapshot.slug ?? '') !== (server.slug ?? '')) return true
  if ((snapshot.text ?? '') !== (server.text ?? '')) return true
  if ((snapshot.category ?? '') !== (server.category ?? '')) return true

  const a = normalizeTags(snapshot.tags)
  const b = normalizeTags(server.tags)
  if (a.length !== b.length) return true
  return a.some((tag, i) => tag !== b[i])
}
