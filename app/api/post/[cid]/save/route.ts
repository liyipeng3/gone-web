// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { getPostByCid } from '@/models/posts'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const post = await getPostByCid(cid)

  return NextResponse.json(post)
}
