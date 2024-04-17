// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { publishPost } from '@/models/posts'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  await publishPost(cid)
  return NextResponse.json({})
}
