// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { incrementViews } from '@/models/posts'

// postView cookie 中保留的最近浏览 cid 上限，防止无限拼接导致 cookie 体积膨胀
const MAX_TRACKED_VIEWS = 200

export async function GET (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  try {
    const cid = parseInt(context.params.cid)
    if (isNaN(cid)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
    }

    const cookiesStore = cookies()
    const postView = cookiesStore.get('postView')?.value

    const views = new Set((postView != null) ? postView.split(',') : [])
    if (!views.has(String(cid))) {
      await incrementViews(cid)
      views.add(String(cid))
      // 仅保留最近 MAX_TRACKED_VIEWS 条，避免 cookie 无限增长
      const trimmed = Array.from(views).slice(-MAX_TRACKED_VIEWS)
      cookiesStore.set('postView', trimmed.join(','))
    }

    return NextResponse.json({})
  } catch (error) {
    console.error('更新浏览量失败:', error)
    return NextResponse.json({ error: '更新浏览量失败' }, { status: 500 })
  }
}
