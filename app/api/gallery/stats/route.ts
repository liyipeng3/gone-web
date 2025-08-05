import { NextResponse } from 'next/server'
import { getGalleryStats } from '@/models/gallery'

// 获取相册统计信息
export async function GET () {
  try {
    const stats = await getGalleryStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取相册统计失败:', error)
    return NextResponse.json(
      { error: '获取相册统计失败' },
      { status: 500 }
    )
  }
}
