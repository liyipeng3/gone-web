import { type NextRequest, NextResponse } from 'next/server'
import { getGalleryList, createGalleryItem } from '@/models/gallery'
import type { GalleryCreateInput, GalleryQuery } from '@/models/gallery'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { parseGalleryPublicQuery } from '@/lib/validations/gallery'

// 获取相册列表
export async function GET (request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicQuery = parseGalleryPublicQuery(searchParams)

    const query: GalleryQuery = {
      ...publicQuery,
      isPublic: true
    }

    const result = await getGalleryList(query)

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取相册列表失败:', error)
    return NextResponse.json(
      { error: '获取相册列表失败' },
      { status: 500 }
    )
  }
}

// 创建相册项（需要管理员权限）
export async function POST (request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (isAuthResponse(auth)) return auth

    const body = await request.json()
    // 确保 takenAt 是 DateTime 类型
    let takenAt: Date | undefined
    if (body.takenAt) {
      // 如果传入的是数字（Unix时间戳），转换为Date
      if (typeof body.takenAt === 'number') {
        takenAt = new Date(body.takenAt * 1000)
      } else if (body.takenAt instanceof Date) {
        takenAt = body.takenAt
      } else if (typeof body.takenAt === 'string') {
        takenAt = new Date(body.takenAt)
      }
    }

    const data: GalleryCreateInput = {
      title: body.title,
      description: body.description,
      imagePath: body.imagePath,
      thumbnailPath: body.thumbnailPath,
      category: body.category,
      tags: body.tags,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      takenAt,
      width: body.width,
      height: body.height,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      camera: body.camera,
      lens: body.lens,
      focalLength: body.focalLength,
      aperture: body.aperture,
      shutterSpeed: body.shutterSpeed,
      iso: body.iso,
      order: body.order,
      isPublic: body.isPublic !== false
    }

    if (!data.imagePath) {
      return NextResponse.json(
        { error: '图片路径不能为空' },
        { status: 400 }
      )
    }

    const result = await createGalleryItem(data)

    return NextResponse.json(result)
  } catch (error) {
    console.error('创建相册项失败:', error)
    return NextResponse.json(
      { error: '创建相册项失败' },
      { status: 500 }
    )
  }
}
