import { NextResponse } from 'next/server'
import { getGalleryTags } from '@/models/gallery'

// 获取相册标签列表
export async function GET () {
  try {
    const tags = await getGalleryTags()

    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取相册标签失败:', error)
    return NextResponse.json(
      { error: '获取相册标签失败' },
      { status: 500 }
    )
  }
}
