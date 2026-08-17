import { type NextRequest, NextResponse } from 'next/server'
import { getGalleryById, updateGalleryItem, deleteGalleryItem } from '@/models/gallery'
import type { GalleryUpdateInput } from '@/models/gallery'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'

// 获取单个相册项
export async function GET (
  request: NextRequest,
  { params }: { params: { gid: string } }
) {
  try {
    const gid = parseInt(params.gid)

    if (isNaN(gid)) {
      return NextResponse.json(
        { error: '无效的相册ID' },
        { status: 400 }
      )
    }

    const gallery = await getGalleryById(gid)

    if (!gallery?.isPublic) {
      return NextResponse.json(
        { error: '相册项不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('获取相册项失败:', error)
    return NextResponse.json(
      { error: '获取相册项失败' },
      { status: 500 }
    )
  }
}

// 更新相册项（需要管理员权限）
export async function PATCH (
  request: NextRequest,
  { params }: { params: { gid: string } }
) {
  try {
    const auth = await requireAdmin()
    if (isAuthResponse(auth)) return auth

    const gid = parseInt(params.gid)

    if (isNaN(gid)) {
      return NextResponse.json(
        { error: '无效的相册ID' },
        { status: 400 }
      )
    }

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

    const data: GalleryUpdateInput = {
      title: body.title,
      description: body.description,
      imagePath: body.imagePath,
      thumbnailPath: body.thumbnailPath,
      category: body.category,
      tags: body.tags,
      location: body.location,
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
      isPublic: body.isPublic
    }

    const result = await updateGalleryItem(gid, data)

    return NextResponse.json(result)
  } catch (error) {
    console.error('更新相册项失败:', error)
    return NextResponse.json(
      { error: '更新相册项失败' },
      { status: 500 }
    )
  }
}

// 删除相册项（需要管理员权限）
export async function DELETE (
  request: NextRequest,
  { params }: { params: { gid: string } }
) {
  try {
    const auth = await requireAdmin()
    if (isAuthResponse(auth)) return auth

    const gid = parseInt(params.gid)

    if (isNaN(gid)) {
      return NextResponse.json(
        { error: '无效的相册ID' },
        { status: 400 }
      )
    }

    const result = await deleteGalleryItem(gid)

    return NextResponse.json(result)
  } catch (error) {
    console.error('删除相册项失败:', error)
    return NextResponse.json(
      { error: '删除相册项失败' },
      { status: 500 }
    )
  }
}
