import { NextResponse } from 'next/server'
import { getGalleryCategories } from '@/models/gallery'

// 获取相册分类列表
export async function GET () {
  try {
    const categories = await getGalleryCategories()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('获取相册分类失败:', error)
    return NextResponse.json(
      { error: '获取相册分类失败' },
      { status: 500 }
    )
  }
}
