// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { createPost, deletePostByCid, getDraftPostByCid, getPostMids, updatePostByCid } from '@/models/posts'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const draftPost = await getDraftPostByCid(cid)

  const newDraft = await request.json()

  let res = null

  if (draftPost) {
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
      modified: Math.floor(Date.now() / 1000),
      category: undefined,
      tags: undefined,
      draft: undefined,
      relationships: { createMany: { data: mids.map(mid => ({ mid })) } },
      parent: cid,
      type: 'post_draft'
    })
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
