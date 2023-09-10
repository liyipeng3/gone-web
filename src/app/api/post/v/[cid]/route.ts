// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { incrementViews } from '@/models/content'

export async function GET (
  request: NextRequest,
  context: { params: { cid: string } }
) {
  const cid = parseInt(context.params.cid)
  const cookiesStore = cookies()
  const postView = cookiesStore.get('postView')?.value

  const views = new Set((postView != null) ? postView.split(',') : [])
  if (!views.has(String(cid))) {
    await incrementViews(cid)
    views.add(String(cid))
    cookiesStore.set('postView', Array.from(views).join(','))
  }

  return NextResponse.json({ })
}
