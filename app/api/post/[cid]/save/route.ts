// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { getPostSlugByCid, updateMetas, updatePostByCid } from '@/models/posts'
import { clearPostRelatedCaches } from '@/models/posts/cache-utils'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { postSaveSchema } from '@/lib/validations/post'

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
  const parsed = postSaveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
  }

  const post = parsed.data
  const category = post.category
  const tags = post.tags

  try {
    const oldSlug = await getPostSlugByCid(cid)
    if (category !== undefined && tags !== undefined) {
      await updateMetas(cid, category, tags)
    }
    const res = await updatePostByCid(cid, {
      title: post.title,
      slug: post.slug,
      text: post.text,
      type: post.type ?? 'post'
    })

    clearPostRelatedCaches({
      cid,
      slugs: [oldSlug, post.slug]
    })

    return NextResponse.json(res)
  } catch (error) {
    console.error('保存文章失败:', error)
    return NextResponse.json({ error: '保存文章失败' }, { status: 500 })
  }
}
