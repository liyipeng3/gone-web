'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRequest } from 'ahooks'
import http from '@/lib/http'
import { SaveScheduler } from '@/lib/save-scheduler'
import {
  writeDraftSnapshot,
  readDraftSnapshot,
  clearDraftSnapshot,
  draftContentDiffers,
  type DraftSnapshot,
  type DraftSnapshotContent
} from '@/lib/draft-snapshot'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// 草稿保存接口返回的精简结构
export interface SaveDraftResponse {
  cid: number
  slug: string
  title: string | null
  updatedAt: string | null
}

interface UseAutoSaveDraftParams {
  cid: string
  /** 当前编辑态内容（由页面维护，hook 只读消费） */
  content: DraftSnapshotContent
  /** 是否允许自动保存（如数据已加载、slug 非空） */
  enabled: boolean
  /** 首次创建独立草稿后，把草稿 cid 回填给页面 */
  onDraftCreated?: (cid: number) => void
}

interface UseAutoSaveDraftResult {
  status: SaveStatus
  lastSavedAt: Date | null
  /** 手动重试（保存失败后） */
  retry: () => void
  /** 保存状态/时间的初始化入口：页面加载数据后调用，设定基线并跳过首次自动保存 */
  initSavedAt: (updatedAt: Date | null) => void
  /** 重置初始化标记（如发布/删除草稿后重新加载数据时） */
  resetInitial: () => void
  /** 清除本地快照（如发布/删除草稿后） */
  clearSnapshot: () => void
  recoverySnapshot: DraftSnapshot | null
  /** 探测本地是否存在比服务端更新的未保存快照 */
  detectRecovery: (server: { content: DraftSnapshotContent, updatedAt: number }) => void
  applyRecovery: () => DraftSnapshotContent | null
  discardRecovery: () => void
}

/**
 * 编辑器草稿自动保存 hook。
 *
 * 整合：防抖节流（useRequest debounce + maxWait）、请求串行化与过期丢弃（SaveScheduler）、
 * 本地快照（崩溃兜底）、页面卸载/关闭 flush（sendBeacon）、崩溃恢复检测、保存状态机。
 */
export const useAutoSaveDraft = ({
  cid,
  content,
  enabled,
  onDraftCreated
}: UseAutoSaveDraftParams): UseAutoSaveDraftResult => {
  const isInitialRef = useRef(false)
  // 始终持有最新内容与“存在未保存改动”标记，供卸载/关闭页时的 flush 使用
  const contentRef = useRef<DraftSnapshotContent>(content)
  const pendingRef = useRef(false)

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [recoverySnapshot, setRecoverySnapshot] = useState<DraftSnapshot | null>(null)

  // 保存请求本体（真正发出网络请求）
  const doSave = useCallback(
    async (payload: DraftSnapshotContent): Promise<SaveDraftResponse> => {
      return await http.post<SaveDraftResponse>(`/api/post/${cid}/draft`, payload)
    },
    [cid]
  )

  // 串行调度器：保证同一时刻至多一个 in-flight，且过期响应被丢弃
  const scheduler = useMemo(
    () =>
      new SaveScheduler<DraftSnapshotContent, SaveDraftResponse>(doSave, {
        onStart: () => {
          setStatus('saving')
        },
        onResult: (res) => {
          pendingRef.current = false
          setStatus('saved')
          setLastSavedAt(res?.updatedAt ? new Date(res.updatedAt) : new Date())
          clearDraftSnapshot(cid)
          if (res?.cid) {
            onDraftCreated?.(res.cid)
          }
        },
        onError: () => {
          setStatus('error')
        }
      }),
    [doSave, cid, onDraftCreated]
  )

  // 防抖 1.5s + maxWait 5s 兜底：命中后交给调度器串行发出
  const { run: scheduleSave } = useRequest(
    async (payload: DraftSnapshotContent) => {
      scheduler.schedule(payload)
    },
    {
      manual: true,
      debounceWait: 1500,
      debounceMaxWait: 5000
    }
  )

  // 保持 contentRef 与最新内容同步，供 flush 读取
  useEffect(() => {
    contentRef.current = content
  }, [content])

  // 内容变更：写本地快照 + 触发防抖保存（跳过初始化后的第一次）
  useEffect(() => {
    if (!enabled) {
      return
    }
    if (!isInitialRef.current) {
      isInitialRef.current = true
      return
    }

    writeDraftSnapshot(cid, content)
    pendingRef.current = true
    setStatus('saving')
    scheduleSave(content)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.text, content.title, content.slug, content.category, JSON.stringify(content.tags), enabled, cid])

  // 页面关闭 / 切走时，尽力补发最后一次未保存内容（防丢）
  useEffect(() => {
    const flush = (): void => {
      if (!pendingRef.current) return
      const payload = contentRef.current
      if (!payload?.slug) return
      try {
        const body = JSON.stringify(payload)
        navigator.sendBeacon(
          `/api/post/${cid}/draft`,
          new Blob([body], { type: 'application/json' })
        )
      } catch {
        // 尽力而为，忽略异常
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      // 组件卸载（如切换文章 / 离开编辑页）时同样 flush
      flush()
    }
  }, [cid])

  const retry = useCallback(() => {
    if (!contentRef.current?.slug) return
    setStatus('saving')
    scheduler.schedule(contentRef.current)
  }, [scheduler])

  const initSavedAt = useCallback((updatedAt: Date | null) => {
    setLastSavedAt(updatedAt)
    pendingRef.current = false
    setStatus('idle')
  }, [])

  const resetInitial = useCallback(() => {
    isInitialRef.current = false
  }, [])

  const clearSnapshot = useCallback(() => {
    clearDraftSnapshot(cid)
    pendingRef.current = false
    setStatus('idle')
  }, [cid])

  const detectRecovery = useCallback(
    (server: { content: DraftSnapshotContent, updatedAt: number }) => {
      const snapshot = readDraftSnapshot(cid)
      if (
        snapshot &&
        snapshot.savedAt > server.updatedAt &&
        draftContentDiffers(snapshot, server.content)
      ) {
        setRecoverySnapshot(snapshot)
      }
    },
    [cid]
  )

  const applyRecovery = useCallback((): DraftSnapshotContent | null => {
    if (!recoverySnapshot) return null
    const { savedAt, ...rest } = recoverySnapshot
    setRecoverySnapshot(null)
    return rest
  }, [recoverySnapshot])

  const discardRecovery = useCallback(() => {
    clearDraftSnapshot(cid)
    setRecoverySnapshot(null)
  }, [cid])

  return {
    status,
    lastSavedAt,
    retry,
    initSavedAt,
    resetInitial,
    clearSnapshot,
    recoverySnapshot,
    detectRecovery,
    applyRecovery,
    discardRecovery
  }
}
