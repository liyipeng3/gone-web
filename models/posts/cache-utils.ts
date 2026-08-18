// 帖子缓存相关工具函数
import { cacheService, cacheKeys } from '@/lib/cache'
import { type HotList, type ArchiveList, type PostListItem } from './types'

// 帖子列表缓存载荷
export interface PostListCachePayload {
  list: PostListItem[]
  total: number
}

/**
 * 获取热门列表缓存键
 */
export const getHotListCacheKey = (limit: number): string => {
  return `${cacheKeys.hotList}:${limit}`
}

/**
 * 获取帖子缓存键
 */
export const getPostCacheKey = (identifier: number | string): string => {
  return `${cacheKeys.post}:${identifier}`
}

/**
 * 获取归档列表缓存键
 */
export const getArchiveCacheKey = (): string => {
  return cacheKeys.archive
}

/**
 * 清除帖子相关缓存
 *
 * @param listCaches 是否连带清除列表类缓存（hotList/postList/archive）。
 *   内容变更（创建/更新/删除/发布）应传 true（默认）；
 *   仅浏览量自增等对列表排序影响甚微的操作应传 false，避免高频击穿列表缓存。
 */
export const clearPostRelatedCaches = ({
  cid,
  slug,
  slugs = [],
  listCaches = true
}: {
  cid?: number
  slug?: string
  slugs?: Array<string | null | undefined>
  listCaches?: boolean
}): void => {
  // 清除特定帖子缓存
  cid && cacheService.del(getPostCacheKey(cid))
  const slugKeys = new Set([slug, ...slugs].filter((value): value is string => Boolean(value)))
  slugKeys.forEach(value => {
    cacheService.del(getPostCacheKey(value))
  })

  if (!listCaches) {
    return
  }

  // 清除可能受影响的列表缓存
  cacheService.delByPrefix(cacheKeys.hotList)
  cacheService.delByPrefix(cacheKeys.postList)
  cacheService.del(cacheKeys.archive)
}

/**
 * 从缓存获取热门列表，如果不存在则返回 null
 */
export const getHotListFromCache = (limit: number): HotList | null => {
  return cacheService.get<HotList>(getHotListCacheKey(limit)) ?? null
}

/**
 * 将热门列表保存到缓存
 */
export const setHotListCache = (limit: number, data: HotList): void => {
  cacheService.set(getHotListCacheKey(limit), data)
}

/**
 * 从缓存获取帖子，如果不存在则返回 null
 */
export const getPostFromCache = <T>(identifier: number | string): T | null => {
  return cacheService.get<T>(getPostCacheKey(identifier)) ?? null
}

/**
 * 将帖子保存到缓存
 */
export const setPostCache = <T>(identifier: number | string, data: T): void => {
  cacheService.set(getPostCacheKey(identifier), data)
}

/**
 * 从缓存获取归档列表，如果不存在则返回 null
 */
export const getArchiveListFromCache = (): ArchiveList | null => {
  return cacheService.get<ArchiveList>(getArchiveCacheKey()) ?? null
}

/**
 * 将归档列表保存到缓存
 */
export const setArchiveListCache = (data: ArchiveList): void => {
  cacheService.set(getArchiveCacheKey(), data)
}

/**
 * 获取帖子列表缓存键
 */
export const getPostListCacheKey = (pageNum: number, pageSize: number, mid?: number, search?: string): string => {
  return `${cacheKeys.postList}:${pageNum}_${pageSize}_${mid ?? 'all'}_${search ?? ''}`
}

/**
 * 从缓存获取帖子列表
 */
export const getPostListFromCache = (pageNum: number, pageSize: number, mid?: number, search?: string): PostListCachePayload | undefined => {
  const cacheKey = getPostListCacheKey(pageNum, pageSize, mid, search)
  return cacheService.get<PostListCachePayload>(cacheKey)
}

/**
 * 设置帖子列表缓存
 */
export const setPostListCache = (pageNum: number, pageSize: number, data: PostListCachePayload, mid?: number, search?: string): void => {
  const cacheKey = getPostListCacheKey(pageNum, pageSize, mid, search)
  // 缓存结果，设置较短的缓存时间（2分钟）
  cacheService.set(cacheKey, data, 120)
}
