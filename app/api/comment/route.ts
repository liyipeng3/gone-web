import { NextResponse } from 'next/server'
import { batchUpdateCommentStatus } from '@/models/comments'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { commentBatchUpdateSchema } from '@/lib/validations/comment'

// 批量更新评论状态（后台批量审核/标记）
export async function PATCH (request: Request) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const parsed = commentBatchUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
  }

  const { coids, status } = parsed.data
  const result = await batchUpdateCommentStatus(coids, status)

  return NextResponse.json({ success: true, count: result.count })
}
