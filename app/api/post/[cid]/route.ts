// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { getPostByCid, getPostSlugByCid, updatePostByCid } from '@/models/posts'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { clearPostRelatedCaches } from '@/models/posts/cache-utils'

export async function GET (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  // 该接口返回草稿/隐藏文章的完整数据，需登录
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseInt(context.params.cid)
  if (isNaN(cid)) {
    return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
  }

  const post = await getPostByCid(cid, true)
  return NextResponse.json(post)
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

  const oldSlug = await getPostSlugByCid(cid)
  const post = await updatePostByCid(cid, { status: 'deleted' })
  clearPostRelatedCaches({
    cid,
    slugs: [oldSlug]
  })

  return NextResponse.json(post)
}
