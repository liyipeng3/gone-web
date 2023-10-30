// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { updateMetas, updatePostByCid } from '@/models/posts'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const post = await request.json()
  const category = post.category
  const tags = post.tags
  await updateMetas(cid, category, tags)
  const res = await updatePostByCid(cid, {
    title: post.title,
    slug: post.title,
    text: post.text,
    type: 'post'
  })
  return NextResponse.json(res)
}
