import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { uploadToOSS, generateFileName } from '@/lib/oss'
import exifr from 'exifr'

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

// 格式化快门速度
function formatShutterSpeed (exposureTime: number): string {
  if (exposureTime >= 1) {
    return `${exposureTime}s`
  } else {
    const fraction = Math.round(1 / exposureTime)
    return `1/${fraction}s`
  }
}

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

    // 提取 EXIF 信息
    let exifData = null
    try {
      console.log('开始提取 EXIF 信息，文件类型:', file.type, '文件大小:', file.size)

      // EXIF 信息主要存在于 JPEG 格式中，部分 TIFF 和 RAW 格式也支持

      // 解析所有 EXIF/元数据信息
      exifData = await exifr.parse(buffer, true)
      console.log('提取到的元数据:', exifData ? '✓ 有数据' : '✗ 无数据')
    } catch (error) {
      console.error('EXIF 提取失败:', error)
      // EXIF 提取失败不影响上传流程
    }

    // 生成文件名
    const fileName = generateFileName(file.name, 'img')

    // 设置上传头部信息
    const headers = {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000' // 1年缓存
    }

    // 上传到OSS
    const result = await uploadToOSS(buffer, fileName, { headers })

    // 处理 EXIF 数据 - 支持多种格式的元数

    const processedExifData = exifData
      ? {
          camera: (exifData.Make && exifData.Model)
            ? `${exifData.Make} ${exifData.Model}`
            : (exifData.CameraProfiles?.Make && exifData.CameraProfiles?.Model)
                ? `${exifData.CameraProfiles.Make} ${exifData.CameraProfiles.Model}`
                : null,
          lens: exifData.LensModel || exifData.Lens || exifData.CameraProfiles?.Lens || null,
          focalLength: exifData.FocalLength
            ? `${exifData.FocalLength}mm`
            : exifData.CameraProfiles?.FocalLength
              ? `${exifData.CameraProfiles.FocalLength}mm`
              : null,
          aperture: exifData.FNumber
            ? (typeof exifData.FNumber === 'string' && exifData.FNumber.includes('/'))
                ? `f/${parseFloat(exifData.FNumber.split('/')[0]) / parseFloat(exifData.FNumber.split('/')[1])}`
                : `f/${exifData.FNumber}`
            : exifData.ApertureValue
              ? `f/${exifData.ApertureValue}`
              : exifData.CameraProfiles?.ApertureValue
                ? `f/${exifData.CameraProfiles.ApertureValue}`
                : null,
          shutterSpeed: exifData.ExposureTime
            ? (typeof exifData.ExposureTime === 'string'
                ? exifData.ExposureTime
                : formatShutterSpeed(exifData.ExposureTime))
            : null,
          iso: exifData.ISO || exifData.ISOSpeedRatings || exifData.PhotographicSensitivity || exifData.StandardOutputSensitivity || null,
          width: exifData.ExifImageWidth || exifData.ImageWidth || exifData.PixelXDimension || null,
          height: exifData.ExifImageHeight || exifData.ImageHeight || exifData.PixelYDimension || null,
          takenAt: (exifData.DateTimeOriginal || exifData.DateTime || exifData.DateTimeDigitized || exifData.DateCreated)
            ? Math.floor(new Date(exifData.DateTimeOriginal || exifData.DateTime || exifData.DateTimeDigitized || exifData.DateCreated).getTime() / 1000)
            : null
        }
      : {}

    // 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        fileName: result.fileName,
        url: result.url,
        originalName: file.name,
        size: file.size,
        type: file.type,
        exif: processedExifData,
        // 开发环境下返回调试信息
        debug: process.env.NODE_ENV === 'development'
          ? {
              rawExifData: exifData,
              hasExifData: !!exifData,
              fileType: file.type
            }
          : undefined
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
