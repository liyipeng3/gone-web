// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import {
  checkDraftSlugUnique,
  createPost,
  deletePostByCid,
  getDraftPostByCid,
  getPostMids,
  updatePostByCid,
  updatePostCategory,
  updatePostTags
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

  const newDraft = parsed.data
  const { category, tags, ...draftData } = newDraft
  const draftPost = await getDraftPostByCid(cid)
  let res = null

  if (draftPost) {
    if (!(await checkDraftSlugUnique(newDraft.slug, cid))) {
      return new NextResponse('slug is already exist', { status: 409 })
    }
    res = await updatePostByCid(draftPost.cid, {
      ...draftData,
      slug: newDraft.slug?.startsWith('@') ? newDraft.slug : `@${newDraft.slug}`,
      type: 'post_draft',
      status: 'hidden',
      parent: cid
    })
  } else {
    const mids = await getPostMids(cid)
    res = await createPost({
      ...draftData,
      slug: `@${newDraft.slug}`,
      relationships: { createMany: { data: mids.map(item => ({ mid: item.mid })) } },
      users: {
        connect: {
          uid: Number(auth.id)
        }
      },
      parent: cid,
      type: 'post_draft',
      status: 'hidden'
    })
  }

  // 更新帖子的标签
  await updatePostTags(res.cid, tags)

  if (category) {
    await updatePostCategory(res.cid, category)
  }

  return NextResponse.json(res)
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
