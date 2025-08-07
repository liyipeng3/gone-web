import prisma from '@/lib/prisma'
import type { gallery } from '@prisma/client'

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
  takenAt?: number
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
  isPublic?: boolean
}

// 创建相册项
export async function createGalleryItem (data: GalleryCreateInput): Promise<gallery> {
  const now = Math.floor(Date.now() / 1000)

  return await prisma.gallery.create({
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      createdAt: now,
      updatedAt: now,
      takenAt: data.takenAt || now
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

  const where: any = {
    isPublic
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
  const now = Math.floor(Date.now() / 1000)

  return await prisma.gallery.update({
    where: { gid },
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      updatedAt: now
    }
  })
}

// 删除相册项
export async function deleteGalleryItem (gid: number): Promise<gallery> {
  return await prisma.gallery.delete({
    where: { gid }
  })
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
