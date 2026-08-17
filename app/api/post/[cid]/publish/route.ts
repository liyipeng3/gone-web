// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { publishPost } from '@/models/posts'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'

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

  try {
    await publishPost(cid)
    return NextResponse.json({})
  } catch (error) {
    console.error('发布文章失败:', error)
    return NextResponse.json({ error: '发布文章失败' }, { status: 500 })
  }
}
