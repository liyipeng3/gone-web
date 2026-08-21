import prisma from '@/lib/prisma'
import type { gallery, Prisma } from '@prisma/client'
import { deleteFromOSS } from '@/lib/oss'
import { cacheService, cacheKeys } from '@/lib/cache'

/**
 * 失效相册聚合类缓存（标签/分类/统计）。
 * 相册项的增删改都会影响这些聚合结果，写操作后统一调用。
 */
const clearGalleryAggregateCaches = (): void => {
  cacheService.delMany([
    cacheKeys.galleryTags,
    cacheKeys.galleryCategories,
    cacheKeys.galleryStats
  ])
}

export interface GalleryItem extends gallery {
  // 可以添加一些计算属性
}

export interface GalleryCreateInput {
  title?: string
  description?: string
  imagePath: string
  thumbnailPath?: string
  category?: string
  tags?: string[]
  location?: string
  latitude?: number
  longitude?: number
  takenAt?: Date
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number
  order?: number
  isPublic?: boolean
}

export interface GalleryUpdateInput extends Partial<GalleryCreateInput> {}

export interface GalleryQuery {
  category?: string
  tag?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'takenAt' | 'order'
  orderDirection?: 'asc' | 'desc'
  isPublic?: boolean | undefined
}

// 创建相册项
export async function createGalleryItem (data: GalleryCreateInput): Promise<gallery> {
  const created = await prisma.gallery.create({
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null
    }
  })
  clearGalleryAggregateCaches()
  return created
}

// 获取相册列表
export async function getGalleryList (query: GalleryQuery = {}): Promise<{
  items: gallery[]
  total: number
}> {
  const {
    category,
    tag,
    limit = 20,
    offset = 0,
    orderBy = 'createdAt',
    orderDirection = 'desc',
    isPublic = true
  } = query

  const where: Prisma.galleryWhereInput = {}

  // 只有当 isPublic 不是 undefined 时才添加到查询条件中
  if (query.isPublic !== undefined) {
    where.isPublic = isPublic
  }

  if (category) {
    where.category = category
  }

  if (tag) {
    where.tags = {
      contains: `"${tag}"`
    }
  }

  const [items, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      // 以 gid 作为稳定兜底键：takenAt/order 存在 null 或并列时，
      // 保证分批 offset 查询顺序稳定，避免无限滚动边界处重复/漏项
      orderBy: [
        { [orderBy]: orderDirection },
        { gid: 'desc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.gallery.count({ where })
  ])

  return { items, total }
}

// 根据ID获取相册项
export async function getGalleryById (gid: number): Promise<gallery | null> {
  return await prisma.gallery.findUnique({
    where: { gid }
  })
}

// 更新相册项
export async function updateGalleryItem (gid: number, data: GalleryUpdateInput): Promise<gallery> {
  const updated = await prisma.gallery.update({
    where: { gid },
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined
    }
  })
  clearGalleryAggregateCaches()
  return updated
}

// 删除相册项
export async function deleteGalleryItem (gid: number): Promise<gallery> {
  // 先获取相册项信息，以便删除OSS文件
  const galleryItem = await prisma.gallery.findUnique({
    where: { gid }
  })

  if (!galleryItem) {
    throw new Error('相册项不存在')
  }

  // 删除数据库记录
  const deletedItem = await prisma.gallery.delete({
    where: { gid }
  })

  // 返回删除的项，但不等待OSS删除完成（异步处理）
  // 这样可以避免OSS删除失败影响数据库操作
  setImmediate(async () => {
    try {
      // 删除主图片
      if (galleryItem.imagePath) {
        await deleteFromOSS(galleryItem.imagePath)
      }

      // 删除缩略图
      if (galleryItem.thumbnailPath) {
        await deleteFromOSS(galleryItem.thumbnailPath)
      }
    } catch (error) {
      console.error('删除OSS文件失败:', error)
      // 这里可以选择记录日志，但不抛出错误
    }
  })

  clearGalleryAggregateCaches()

  return deletedItem
}

// 获取所有分类
export async function getGalleryCategories (): Promise<string[]> {
  const cached = cacheService.get<string[]>(cacheKeys.galleryCategories)
  if (cached) {
    return cached
  }

  const result = await prisma.gallery.findMany({
    where: {
      isPublic: true,
      category: { not: null }
    },
    select: {
      category: true
    },
    distinct: ['category']
  })

  const categories = result
    .map(item => item.category)
    .filter(Boolean) as string[]

  cacheService.set(cacheKeys.galleryCategories, categories)

  return categories
}

// 获取所有标签
export async function getGalleryTags (): Promise<string[]> {
  const cached = cacheService.get<string[]>(cacheKeys.galleryTags)
  if (cached) {
    return cached
  }

  const result = await prisma.gallery.findMany({
    where: {
      isPublic: true,
      tags: { not: null }
    },
    select: {
      tags: true
    }
  })

  const allTags = new Set<string>()

  result.forEach(item => {
    if (item.tags) {
      try {
        const tags = JSON.parse(item.tags) as string[]
        tags.forEach(tag => allTags.add(tag))
      } catch (error) {
        console.error('Failed to parse tags:', error)
      }
    }
  })

  const tags = Array.from(allTags)
  cacheService.set(cacheKeys.galleryTags, tags)

  return tags
}

// 获取相册统计信息
export async function getGalleryStats (): Promise<{
  totalImages: number
  totalCategories: number
  totalTags: number
  recentImages: gallery[]
}> {
  const cached = cacheService.get<{
    totalImages: number
    totalCategories: number
    totalTags: number
    recentImages: gallery[]
  }>(cacheKeys.galleryStats)
  if (cached) {
    return cached
  }

  const [totalImages, categories, tags, recentImages] = await Promise.all([
    prisma.gallery.count({ where: { isPublic: true } }),
    getGalleryCategories(),
    getGalleryTags(),
    prisma.gallery.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  const stats = {
    totalImages,
    totalCategories: categories.length,
    totalTags: tags.length,
    recentImages
  }

  cacheService.set(cacheKeys.galleryStats, stats)

  return stats
}

// 获取相邻的照片（用于导航）
export async function getAdjacentPhotos (currentGid: number, category?: string): Promise<{
  previous: gallery | null
  next: gallery | null
  current: number
  total: number
}> {
  const where: Prisma.galleryWhereInput = { isPublic: true }
  if (category) {
    where.category = category
  }

  // 先确认当前照片在集合内，并取出用于定位的 takenAt
  const current = await prisma.gallery.findFirst({
    where: { ...where, gid: currentGid },
    select: { gid: true, takenAt: true }
  })

  if (!current) {
    const total = await prisma.gallery.count({ where })
    return { previous: null, next: null, current: 0, total }
  }

  // 稳定排序：takenAt 降序，同一时间以 gid 降序兜底
  const orderBy = [{ takenAt: 'desc' as const }, { gid: 'desc' as const }]

  // 位于当前项“之前”（列表更靠前 = 更新）的判定条件，用于计算序号
  // MySQL 在 desc 排序下将 NULL 视为最后，因此 takenAt 更大或（同值 gid 更大）者排在前
  const beforeWhere = current.takenAt != null
    ? {
        ...where,
        OR: [
          { takenAt: { gt: current.takenAt } },
          { takenAt: current.takenAt, gid: { gt: currentGid } }
        ]
      }
    : {
        ...where,
        OR: [
          { takenAt: { not: null } },
          { takenAt: null, gid: { gt: currentGid } }
        ]
      }

  const [previous, next, total, beforeCount] = await Promise.all([
    // 列表中位于当前项之前的一张（更新）
    prisma.gallery.findMany({ where, orderBy, cursor: { gid: currentGid }, skip: 1, take: -1 })
      .then(rows => rows[0] ?? null),
    // 列表中位于当前项之后的一张（更旧）
    prisma.gallery.findMany({ where, orderBy, cursor: { gid: currentGid }, skip: 1, take: 1 })
      .then(rows => rows[0] ?? null),
    prisma.gallery.count({ where }),
    prisma.gallery.count({ where: beforeWhere })
  ])

  return {
    previous,
    next,
    current: beforeCount + 1,
    total
  }
}
