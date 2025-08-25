import prisma from '@/lib/prisma'
import type { gallery } from '@prisma/client'
import { deleteFromOSS } from '@/lib/oss'

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
  return await prisma.gallery.create({
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null
    }
  })
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

  const where: any = {}

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
      orderBy: {
        [orderBy]: orderDirection
      },
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
  return await prisma.gallery.update({
    where: { gid },
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined
    }
  })
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

  return deletedItem
}

// 获取所有分类
export async function getGalleryCategories (): Promise<string[]> {
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

  return result
    .map(item => item.category)
    .filter(Boolean) as string[]
}

// 获取所有标签
export async function getGalleryTags (): Promise<string[]> {
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

  return Array.from(allTags)
}

// 获取相册统计信息
export async function getGalleryStats (): Promise<{
  totalImages: number
  totalCategories: number
  totalTags: number
  recentImages: gallery[]
}> {
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

  return {
    totalImages,
    totalCategories: categories.length,
    totalTags: tags.length,
    recentImages
  }
}

// 获取相邻的照片（用于导航）
export async function getAdjacentPhotos (currentGid: number, category?: string): Promise<{
  previous: gallery | null
  next: gallery | null
  current: number
  total: number
}> {
  const where: any = { isPublic: true }
  if (category) {
    where.category = category
  }

  // 获取所有公开照片的ID，按拍摄时间排序
  const allPhotos = await prisma.gallery.findMany({
    where,
    select: { gid: true },
    orderBy: { takenAt: 'desc' }
  })

  const currentIndex = allPhotos.findIndex(photo => photo.gid === currentGid)

  if (currentIndex === -1) {
    return { previous: null, next: null, current: 0, total: allPhotos.length }
  }

  // 获取前一张和后一张照片的详细信息
  const [previous, next] = await Promise.all([
    currentIndex > 0
      ? prisma.gallery.findUnique({ where: { gid: allPhotos[currentIndex - 1].gid } })
      : null,
    currentIndex < allPhotos.length - 1
      ? prisma.gallery.findUnique({ where: { gid: allPhotos[currentIndex + 1].gid } })
      : null
  ])

  return {
    previous,
    next,
    current: currentIndex + 1,
    total: allPhotos.length
  }
}
