// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { createPost, getDraftPostByCid, updatePostByCid } from '@/models/posts'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const draftPost = await getDraftPostByCid(cid)
  const newDraft = await request.json()

  let res = null

  if (draftPost) {
    res = await updatePostByCid(draftPost.cid, { ...newDraft, slug: newDraft.slug?.startsWith('@') ? newDraft.slug : `@${newDraft.slug}`, draft: undefined })
  } else {
    res = await createPost({ ...newDraft, cid: undefined, slug: `@${newDraft.slug}`, parent: cid, type: 'post_draft', draft: undefined })
  }

  return NextResponse.json(res)
}
