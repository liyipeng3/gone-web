import { NextResponse } from 'next/server'
import { generateThumbnail, generateThumbnailFileName } from '@/lib/oss'

export async function GET () {
  try {
    // 创建一个简单的测试图片buffer（1x1像素的PNG）
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])

    // 测试缩略图生成
    const thumbnailBuffer = await generateThumbnail(testImageBuffer, {
      maxWidth: 100,
      maxHeight: 100,
      quality: 80,
      format: 'png'
    })

    // 测试文件名生成
    const originalFileName = 'test/image.jpg'
    const thumbnailFileName = generateThumbnailFileName(originalFileName)

    return NextResponse.json({
      success: true,
      message: '缩略图功能测试成功',
      data: {
        originalImageSize: testImageBuffer.length,
        thumbnailSize: thumbnailBuffer.length,
        originalFileName,
        thumbnailFileName,
        thumbnailGenerated: thumbnailBuffer.length > 0
      }
    })
  } catch (error) {
    console.error('缩略图功能测试失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '缩略图功能测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
