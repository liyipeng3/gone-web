// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { createPost } from '@/models/posts'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'

export async function POST (
  request: NextRequest
) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  try {
    const res = await createPost({
      type: 'post',
      status: 'hidden',
      users: {
        connect: {
          uid: Number(auth.id)
        }
      }
    })
    return NextResponse.json(res)
  } catch (error) {
    console.error('创建文章失败:', error)
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}
