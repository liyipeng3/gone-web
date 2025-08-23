import OSS from 'ali-oss'
import sharp from 'sharp'

interface OSSConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  baseUrl?: string
}

// OSS配置
const ossConfig: OSSConfig = {
  region: process.env.OSS_REGION ?? 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? '',
  bucket: process.env.OSS_BUCKET ?? '',
  baseUrl: process.env.OSS_BASE_URL
}

// 创建OSS客户端实例
export const createOSSClient = (): OSS => {
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
    throw new Error('OSS配置不完整，请检查环境变量设置')
  }

  const clientConfig = {
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket
  }

  return new OSS(clientConfig)
}

// 生成文件名
export const generateFileName = (originalName: string, prefix = 'img'): string => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${prefix}/${timestamp}_${randomStr}.${extension}`
}

// 获取文件的完整URL
export const getFileUrl = (fileName: string): string => {
  if (ossConfig.baseUrl) {
    return `${ossConfig.baseUrl}/${fileName}`
  }

  return `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fileName}`
}

// 上传文件到OSS
export const uploadToOSS = async (
  file: Buffer | Uint8Array,
  fileName: string,
  options?: {
    headers?: Record<string, string>
  }
): Promise<{ fileName: string, url: string }> => {
  try {
    const client = createOSSClient()

    const uploadOptions: any = {
      timeout: 30000 // 30秒超时
    }

    if (options?.headers) {
      uploadOptions.headers = options.headers
    }

    const result = await client.put(fileName, file, uploadOptions)

    // 总是优先使用自定义域名URL（如果配置了OSS_BASE_URL）
    let fileUrl = result.url
    if (ossConfig.baseUrl) {
      fileUrl = getFileUrl(result.name)
    }

    return {
      fileName: result.name,
      url: fileUrl
    }
  } catch (error) {
    console.error('OSS上传失败:', error)
    throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 删除OSS文件
export const deleteFromOSS = async (url: string): Promise<void> => {
  const fileName = url.split(ossConfig.baseUrl ?? '').pop()
  if (!fileName) {
    throw new Error('无效的文件URL')
  }

  try {
    const client = createOSSClient()
    await client.delete(fileName)
  } catch (error) {
    console.error('OSS删除文件失败:', error)
    throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 生成缩略图
export const generateThumbnail = async (
  imageBuffer: Buffer,
  options: {
    maxWidth?: number
    maxHeight?: number
    originalWidth?: number
    originalHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<Buffer> => {
  const {
    maxWidth = 300,
    maxHeight = 300,
    originalWidth = 300,
    originalHeight = 300,
    quality = 80,
    format = 'jpeg'
  } = options

  try {
    // 先获取原图信息

    if (!originalWidth || !originalHeight) {
      throw new Error('无法获取原图尺寸信息')
    }

    // 计算保持宽高比的缩略图尺寸
    const aspectRatio = originalWidth / originalHeight
    let thumbnailWidth = maxWidth
    let thumbnailHeight = maxHeight

    if (aspectRatio > maxWidth / maxHeight) {
      // 原图更宽，以宽度为准
      thumbnailHeight = Math.round(maxWidth / aspectRatio)
    } else {
      // 原图更高，以高度为准
      thumbnailWidth = Math.round(maxHeight * aspectRatio)
    }

    let sharpInstance = sharp(imageBuffer)
      .resize(thumbnailWidth, thumbnailHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })

    // 根据格式设置输出选项
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality })
        break
      case 'png':
        sharpInstance = sharpInstance.png({ quality })
        break
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality })
        break
    }

    return await sharpInstance.toBuffer()
  } catch (error) {
    console.error('生成缩略图失败:', error)
    throw new Error(`缩略图生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 生成缩略图文件名
export const generateThumbnailFileName = (originalFileName: string): string => {
  const parts = originalFileName.split('.')
  const extension = parts.pop()
  const baseName = parts.join('.')
  return `${baseName}_thumb.${extension}`
}

const oss = {
  createOSSClient,
  generateFileName,
  getFileUrl,
  uploadToOSS,
  deleteFromOSS,
  generateThumbnail,
  generateThumbnailFileName
}

export default oss
