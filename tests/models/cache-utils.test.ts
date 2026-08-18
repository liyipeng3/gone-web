import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheService, cacheKeys } from '@/lib/cache'
import {
  clearPostRelatedCaches,
  getPostCacheKey,
  getPostListCacheKey,
  getPostListFromCache,
  setPostListCache
} from '@/models/posts/cache-utils'

describe('post cache-utils', () => {
  beforeEach(() => {
    cacheService.flush()
  })

  afterEach(() => {
    cacheService.flush()
    vi.restoreAllMocks()
  })

  it('round-trips the post list payload through the cache', () => {
    const payload = { list: [], total: 0 }
    setPostListCache(1, 7, payload, undefined, '')

    expect(getPostListFromCache(1, 7, undefined, '')).toEqual(payload)
    // 不同分页参数命中不同的键
    expect(getPostListFromCache(2, 7, undefined, '')).toBeUndefined()
  })

  it('delByPrefix clears every key sharing the prefix, keeping others intact', () => {
    cacheService.set(getPostListCacheKey(1, 7), { list: [], total: 0 })
    cacheService.set(getPostListCacheKey(2, 7), { list: [], total: 0 })
    cacheService.set(getPostCacheKey('a-slug'), { cid: 1 })

    cacheService.delByPrefix(cacheKeys.postList)

    expect(getPostListFromCache(1, 7)).toBeUndefined()
    expect(getPostListFromCache(2, 7)).toBeUndefined()
    // 单篇文章缓存前缀不同，不应被清除
    expect(cacheService.get(getPostCacheKey('a-slug'))).toEqual({ cid: 1 })
  })

  it('clearPostRelatedCaches only drops the single post when listCaches is false', () => {
    cacheService.set(getPostCacheKey(42), { cid: 42 })
    cacheService.set(getPostListCacheKey(1, 7), { list: [], total: 0 })
    cacheService.set(cacheKeys.archive, [])

    clearPostRelatedCaches({ cid: 42, listCaches: false })

    expect(cacheService.get(getPostCacheKey(42))).toBeUndefined()
    // 列表/归档缓存应保留，避免浏览量自增击穿列表缓存
    expect(cacheService.get(getPostListCacheKey(1, 7))).toEqual({ list: [], total: 0 })
    expect(cacheService.get(cacheKeys.archive)).toEqual([])
  })

  it('clearPostRelatedCaches drops post, list and archive caches by default', () => {
    cacheService.set(getPostCacheKey(42), { cid: 42 })
    cacheService.set(getPostCacheKey('a-slug'), { cid: 42 })
    cacheService.set(getPostListCacheKey(1, 7), { list: [], total: 0 })
    cacheService.set(`${cacheKeys.hotList}:5`, [])
    cacheService.set(cacheKeys.archive, [])

    clearPostRelatedCaches({ cid: 42, slug: 'a-slug' })

    expect(cacheService.get(getPostCacheKey(42))).toBeUndefined()
    expect(cacheService.get(getPostCacheKey('a-slug'))).toBeUndefined()
    expect(cacheService.get(getPostListCacheKey(1, 7))).toBeUndefined()
    expect(cacheService.get(`${cacheKeys.hotList}:5`)).toBeUndefined()
    expect(cacheService.get(cacheKeys.archive)).toBeUndefined()
  })
})
