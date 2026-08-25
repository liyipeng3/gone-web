import { type NextRequest, NextResponse } from 'next/server'
import { getGalleryList, createGalleryItem } from '@/models/gallery'
import type { GalleryQuery } from '@/models/gallery'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { handleApiError, readJson } from '@/lib/api-response'
import { parseGalleryPublicQuery, galleryCreateSchema } from '@/lib/validations/gallery'

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
    return handleApiError(error, '获取相册列表失败')
  }
}

// 创建相册项（需要管理员权限）
export async function POST (request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (isAuthResponse(auth)) return auth

    const body = await readJson(request)
    if (isAuthResponse(body)) return body

    const parsed = galleryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
    }

    const result = await createGalleryItem(parsed.data)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, '创建相册项失败')
  }
}
