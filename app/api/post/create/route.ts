// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { createPost } from '@/models/posts'

export async function POST (
  request: NextRequest
) {
  const res = await createPost({
    type: 'post',
    status: 'hidden'
  })
  return NextResponse.json(res)
}
