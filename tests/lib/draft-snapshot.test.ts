import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  writeDraftSnapshot,
  readDraftSnapshot,
  clearDraftSnapshot,
  draftContentDiffers,
  normalizeTags,
  type DraftSnapshotContent
} from '@/lib/draft-snapshot'

// 简易内存版 localStorage，用于在 node 环境模拟浏览器存储
const createMemoryStorage = () => {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => { store.clear() }
  }
}

describe('draft-snapshot', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: createMemoryStorage() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('normalizeTags', () => {
    it('去空、去重、排序后返回', () => {
      expect(normalizeTags(['b', 'a', 'a', '', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('undefined 归一为空数组', () => {
      expect(normalizeTags(undefined)).toEqual([])
    })
  })

  describe('write/read/clear', () => {
    it('写入后可读回并带 savedAt', () => {
      const content: DraftSnapshotContent = { title: 't', slug: 's', text: 'x', category: 'c', tags: ['a'] }
      writeDraftSnapshot('10', content)
      const snap = readDraftSnapshot('10')
      expect(snap).not.toBeNull()
      expect(snap?.title).toBe('t')
      expect(typeof snap?.savedAt).toBe('number')
    })

    it('不存在时返回 null', () => {
      expect(readDraftSnapshot('999')).toBeNull()
    })

    it('clear 后读不到', () => {
      writeDraftSnapshot('11', { slug: 's' })
      clearDraftSnapshot('11')
      expect(readDraftSnapshot('11')).toBeNull()
    })

    it('损坏的 JSON 返回 null 而非抛错', () => {
      window.localStorage.setItem('gone-web:draft:12', '{not-json')
      expect(readDraftSnapshot('12')).toBeNull()
    })
  })

  describe('draftContentDiffers', () => {
    const base: DraftSnapshotContent = { title: 't', slug: 's', text: 'x', category: 'c', tags: ['a', 'b'] }

    it('完全一致返回 false', () => {
      expect(draftContentDiffers({ ...base }, { ...base })).toBe(false)
    })

    it('tags 顺序不同但内容相同视为一致', () => {
      expect(draftContentDiffers({ ...base, tags: ['b', 'a'] }, base)).toBe(false)
    })

    it('title 变化返回 true', () => {
      expect(draftContentDiffers({ ...base, title: 't2' }, base)).toBe(true)
    })

    it('text 变化返回 true', () => {
      expect(draftContentDiffers({ ...base, text: 'y' }, base)).toBe(true)
    })

    it('tags 新增返回 true', () => {
      expect(draftContentDiffers({ ...base, tags: ['a', 'b', 'c'] }, base)).toBe(true)
    })

    it('null 与空串视为一致', () => {
      expect(draftContentDiffers({ title: null }, { title: '' })).toBe(false)
    })
  })
})
