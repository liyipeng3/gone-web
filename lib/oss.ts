import OSS from 'ali-oss'

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
export const deleteFromOSS = async (fileName: string): Promise<void> => {
  try {
    const client = createOSSClient()
    await client.delete(fileName)
  } catch (error) {
    console.error('OSS删除文件失败:', error)
    throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const oss = {
  createOSSClient,
  generateFileName,
  getFileUrl,
  uploadToOSS,
  deleteFromOSS
}

export default oss
