// 相册上传相关的纯逻辑与类型（无 React 状态，便于复用与单测）

export interface FilePreview {
  file: File
  preview: string
  title: string
  description: string
  category: string
  tags: string[]
  location: string
  isPublic: boolean
  country?: string
  province?: string
  city?: string
  takenAt?: Date | null
  errors?: {
    title?: boolean
    country?: boolean
    province?: boolean
    city?: boolean
    takenAt?: boolean
  }
}

export interface UploadResult {
  url: string
  thumbnailUrl?: string
  exif: any
}

/**
 * 读取图片 EXIF 中的拍摄时间，读取失败返回 null。
 */
export const readExifData = async (file: File): Promise<Date | null> => {
  try {
    const exifr = (await import('exifr')).default
    const buffer = await file.arrayBuffer()
    const exifData = await exifr.parse(buffer, true)

    if (exifData && (exifData.DateTimeOriginal || exifData.DateTime || exifData.DateTimeDigitized)) {
      const takenAtTimestamp = exifData.DateTimeOriginal || exifData.DateTime || exifData.DateTimeDigitized
      return new Date(takenAtTimestamp)
    }
  } catch (error) {
    console.error('读取EXIF信息失败:', error)
  }
  return null
}

/**
 * 上传单个文件到图片接口，返回可访问 URL、缩略图与 EXIF 信息。
 */
export const uploadFileToServer = async (file: File): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    let errorMessage = `上传失败 (HTTP ${response.status})`

    try {
      const errorData = await response.json()
      console.error('上传错误详情:', errorData)

      if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.message) {
        errorMessage = errorData.message
      }

      if (errorData.debug) {
        console.error('调试信息:', errorData.debug)
      }
    } catch (parseError) {
      console.error('无法解析错误响应:', parseError)
      try {
        const errorText = await response.text()
        console.error('错误响应文本:', errorText)
        if (errorText) {
          errorMessage += ': ' + errorText.substring(0, 100)
        }
      } catch (textError) {
        console.error('无法获取错误文本:', textError)
      }
    }

    throw new Error(errorMessage)
  }

  const result = await response.json()

  return {
    url: result.data.url,
    thumbnailUrl: result.data.thumbnailUrl || undefined,
    exif: result.data.exif || {}
  }
}

/**
 * 校验待上传文件的必填项，返回每个文件更新后的 errors 与整体是否通过。
 */
export const validateFilePreviews = (
  files: FilePreview[]
): { files: FilePreview[], valid: boolean } => {
  let hasErrors = false

  const updatedFiles = files.map((filePreview) => {
    const errors: FilePreview['errors'] = {}

    if (!filePreview.title?.trim()) {
      errors.title = true
      hasErrors = true
    }
    if (!filePreview.country) {
      errors.country = true
      hasErrors = true
    }
    if (!filePreview.province) {
      errors.province = true
      hasErrors = true
    }
    if (!filePreview.city) {
      errors.city = true
      hasErrors = true
    }
    if (!filePreview.takenAt) {
      errors.takenAt = true
      hasErrors = true
    }

    return { ...filePreview, errors }
  })

  return { files: updatedFiles, valid: !hasErrors }
}
