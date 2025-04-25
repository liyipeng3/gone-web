// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextResponse } from 'next/server'
import { getPostBySlug } from '@/models/posts'

// 获取 about 页面数据
export async function GET () {
  try {
    const post = await getPostBySlug('about')

    if (!post) {
      return NextResponse.json({ error: '未找到 About 页面' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || '获取 About 页面失败' },
      { status: 500 }
    )
  }
}
