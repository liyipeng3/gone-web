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

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const draftPost = await getDraftPostByCid(cid)

  const newDraft = await request.json()

  let res = null

  if (draftPost) {
    if (!(await checkDraftSlugUnique(newDraft.slug.slice(1), cid))) {
      console.log(newDraft.slug)
      return new NextResponse('slug is already exist', { status: 500 })
    }
    res = await updatePostByCid(draftPost.cid, {
      ...newDraft,
      slug: newDraft.slug?.startsWith('@') ? newDraft.slug : `@${newDraft.slug}`,
      modified: Math.floor(Date.now() / 1000),
      relationships: undefined,
      cid: undefined,
      tags: undefined,
      category: undefined,
      draft: undefined,
      type: 'post_draft',
      parent: cid
    })
  } else {
    const mids = await getPostMids(cid)
    res = await createPost({
      ...newDraft,
      cid: undefined,
      slug: `@${newDraft.slug}`,
      created: Math.floor(Date.now() / 1000),
      modified: Math.floor(Date.now() / 1000),
      category: undefined,
      tags: undefined,
      draft: undefined,
      relationships: { createMany: { data: mids.map(mid => ({ mid })) } },
      parent: cid,
      type: 'post_draft'
    })
  }

  // 更新帖子的标签
  if (newDraft.tags) {
    await updatePostTags(res.cid, newDraft.tags)
  }

  if (newDraft.category) {
    await updatePostCategory(res.cid, newDraft.category)
  }

  return NextResponse.json(res)
}

export async function DELETE (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const draftPost = await getDraftPostByCid(cid)

  if (draftPost) {
    await deletePostByCid(draftPost.cid)
  }

  return NextResponse.json({})
}
