// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { getPostSlugByCid, updateMetas, updatePostByCid } from '@/models/posts'
import { clearPostRelatedCaches } from '@/models/posts/cache-utils'
import { requireAdmin, isAuthResponse, parseId } from '@/lib/api-auth'
import { handleApiError, readJson } from '@/lib/api-response'
import { postSaveSchema } from '@/lib/validations/post'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseId(context.params.cid, '文章ID')
  if (isAuthResponse(cid)) return cid

  const body = await readJson(request)
  if (isAuthResponse(body)) return body

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
    return handleApiError(error, '保存文章失败')
  }
}
