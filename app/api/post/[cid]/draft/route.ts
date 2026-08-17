// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import {
  deletePostByCid,
  getDraftPostByCid,
  saveDraftAtomic,
  DraftSlugConflictError
} from '@/models/posts'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { postDraftSchema } from '@/lib/validations/post'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseInt(context.params.cid)
  if (isNaN(cid)) {
    return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = postDraftSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
  }

  const { category, tags, ...draftData } = parsed.data

  try {
    // 草稿保存 + 标签/分类同步在单个事务内原子完成，仅在变化时重写关系
    const res = await saveDraftAtomic(cid, {
      title: draftData.title,
      slug: draftData.slug,
      text: draftData.text,
      category,
      tags
    }, Number(auth.id))

    return NextResponse.json(res)
  } catch (error) {
    if (error instanceof DraftSlugConflictError) {
      return new NextResponse('slug is already exist', { status: 409 })
    }
    console.error('保存草稿失败:', error)
    return NextResponse.json({ error: '保存草稿失败' }, { status: 500 })
  }
}

export async function DELETE (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseInt(context.params.cid)
  if (isNaN(cid)) {
    return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
  }
  const draftPost = await getDraftPostByCid(cid)

  if (draftPost) {
    await deletePostByCid(draftPost.cid)
  }

  return NextResponse.json({})
}
