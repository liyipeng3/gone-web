import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { uploadToOSS, generateFileName } from '@/lib/oss'

// 支持的图片类型
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// 最大文件大小 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST (request: NextRequest) {
  try {
    // 验证用户权限
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          error: '未选择文件',
          debug: {
            formDataKeys: Array.from(formData.keys()),
            fileValue: formData.get('file')
          }
        },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: '不支持的文件类型，请上传 JPG、PNG、WebP 或 GIF 格式的图片',
          debug: {
            receivedType: file.type,
            supportedTypes: SUPPORTED_IMAGE_TYPES,
            fileName: file.name
          }
        },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: '文件大小超过限制，最大支持50MB',
          debug: {
            fileSize: file.size,
            maxSize: MAX_FILE_SIZE,
            fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
          }
        },
        { status: 400 }
      )
    }

    // 读取文件数据
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 生成文件名
    const fileName = generateFileName(file.name, 'img')

    // 设置上传头部信息
    const headers = {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000' // 1年缓存
    }

    // 上传到OSS
    const result = await uploadToOSS(buffer, fileName, { headers })

    // 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        fileName: result.fileName,
        url: result.url,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('图片上传失败:', error)

    // 返回详细错误信息
    const errorMessage = error instanceof Error ? error.message : '图片上传失败'

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 支持的HTTP方法
export const runtime = 'nodejs'

// 设置更大的请求体限制以支持大文件上传
export const maxDuration = 60 // 60秒超时
export const dynamic = 'force-dynamic'
