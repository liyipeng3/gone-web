import { type NextRequest, NextResponse } from 'next/server'
import { getGalleryList, createGalleryItem } from '@/models/gallery'
import { getCurrentUser } from '@/lib/session'
import type { GalleryCreateInput, GalleryQuery } from '@/models/gallery'

// 获取相册列表
export async function GET (request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: GalleryQuery = {
      category: searchParams.get('category') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
      limit: parseInt(searchParams.get('limit') ?? '20'),
      offset: parseInt(searchParams.get('offset') ?? '0'),
      orderBy: (searchParams.get('orderBy') as any) || 'createdAt',
      orderDirection: (searchParams.get('orderDirection') as any) || 'desc',
      isPublic: searchParams.get('isPublic') !== 'false'
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
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
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
      takenAt: body.takenAt,
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
