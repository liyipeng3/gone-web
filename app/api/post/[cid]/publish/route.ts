// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { publishPost } from '@/models/posts'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthResponse, parseId } from '@/lib/api-auth'
import { handleApiError } from '@/lib/api-response'

export async function POST (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const cid = parseId(context.params.cid, '文章ID')
  if (isAuthResponse(cid)) return cid

  try {
    await publishPost(cid)
    return NextResponse.json({})
  } catch (error) {
    return handleApiError(error, '发布文章失败')
  }
}
