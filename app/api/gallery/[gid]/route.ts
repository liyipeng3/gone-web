import { type NextRequest, NextResponse } from 'next/server'
import { getGalleryById, updateGalleryItem, deleteGalleryItem } from '@/models/gallery'
import { requireAdmin, isAuthResponse, parseId } from '@/lib/api-auth'
import { handleApiError, readJson } from '@/lib/api-response'
import { galleryUpdateSchema } from '@/lib/validations/gallery'

// 获取单个相册项
export async function GET (
  request: NextRequest,
  { params }: { params: { gid: string } }
) {
  try {
    const gid = parseId(params.gid, '相册ID')
    if (isAuthResponse(gid)) return gid

    const gallery = await getGalleryById(gid)

    if (!gallery?.isPublic) {
      return NextResponse.json(
        { error: '相册项不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(gallery)
  } catch (error) {
    return handleApiError(error, '获取相册项失败')
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

    const gid = parseId(params.gid, '相册ID')
    if (isAuthResponse(gid)) return gid

    const body = await readJson(request)
    if (isAuthResponse(body)) return body

    const parsed = galleryUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
    }

    const result = await updateGalleryItem(gid, parsed.data)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, '更新相册项失败')
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

    const gid = parseId(params.gid, '相册ID')
    if (isAuthResponse(gid)) return gid

    const result = await deleteGalleryItem(gid)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, '删除相册项失败')
  }
}
