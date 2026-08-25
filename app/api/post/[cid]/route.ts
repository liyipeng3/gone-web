// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { getPostByCid, getPostSlugByCid, updatePostByCid } from '@/models/posts'
import { requireAdmin, isAuthResponse, parseId } from '@/lib/api-auth'
import { clearPostRelatedCaches } from '@/models/posts/cache-utils'

export async function GET (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  // 该接口返回草稿/隐藏文章的完整数据，需登录
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseId(context.params.cid, '文章ID')
  if (isAuthResponse(cid)) return cid

  const post = await getPostByCid(cid, true)
  return NextResponse.json(post)
}

export async function DELETE (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseId(context.params.cid, '文章ID')
  if (isAuthResponse(cid)) return cid

  const oldSlug = await getPostSlugByCid(cid)
  const post = await updatePostByCid(cid, { status: 'deleted' })
  clearPostRelatedCaches({
    cid,
    slugs: [oldSlug]
  })

  return NextResponse.json(post)
}
