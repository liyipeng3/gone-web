'use client'

import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCountries, getProvinces, getCities } from '@/lib/regions'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { DateTimePicker } from '@/components/ui/date-time-picker'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FilePreview {
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

const GalleryUploadDialog: React.FC<GalleryUploadDialogProps> = ({
  open,
  onOpenChange
}) => {
  const router = useRouter()
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // 读取EXIF信息（不上传文件）
  const readExifData = async (file: File) => {
    try {
      // 使用exifr库直接读取EXIF
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

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FilePreview[] = []

    for (const file of Array.from(selectedFiles)) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)

        // 自动获取EXIF信息
        const takenAt = await readExifData(file)

        newFiles.push({
          file,
          preview,
          title: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
          description: '',
          category: '',
          tags: [],
          location: '',
          isPublic: true,
          country: '中国',
          province: undefined,
          city: undefined,
          takenAt,
          errors: {}
        })
      }
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  // 移除文件
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // 更新文件信息
  const updateFile = (index: number, updates: Partial<FilePreview>) => {
    setFiles(prev => {
      const newFiles = [...prev]
      newFiles[index] = { ...newFiles[index], ...updates }
      return newFiles
    })
  }

  // 解析标签字符串
  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

  // 上传文件到OSS
  const uploadFileToServer = async (file: File): Promise<{ url: string, exif: any }> => {
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

        // 如果有调试信息，也打印出来
        if (errorData.debug) {
          console.error('调试信息:', errorData.debug)
        }
      } catch (parseError) {
        console.error('无法解析错误响应:', parseError)
        // 尝试获取原始文本
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
      exif: result.data.exif || {}
    }
  }

  // 表单验证
  const validateFiles = (): boolean => {
    let hasErrors = false

    const updatedFiles = files.map((filePreview) => {
      const errors: FilePreview['errors'] = {}

      // 验证标题
      if (!filePreview.title?.trim()) {
        errors.title = true
        hasErrors = true
      }

      // 验证地区信息
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

      // 验证拍摄时间
      if (!filePreview.takenAt) {
        errors.takenAt = true
        hasErrors = true
      }

      return {
        ...filePreview,
        errors
      }
    })

    setFiles(updatedFiles)
    return !hasErrors
  }

  // 处理上传
  const handleUpload = async () => {
    if (files.length === 0) return

    // 表单验证
    const isValid = validateFiles()
    if (!isValid) {
      return
    }

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const filePreview = files[i]

        // 上传文件
        const uploadResult = await uploadFileToServer(filePreview.file)

        // 如果选择了国家/省/市，拼装位置字符串
        const selectedLocation = [filePreview.country, filePreview.province, filePreview.city]
          .filter(Boolean)
          .join(' · ')

        // 使用用户填写的拍摄时间
        const finalTakenAt = filePreview.takenAt
          ? Math.floor(filePreview.takenAt.getTime() / 1000)
          : uploadResult.exif.takenAt

        // 创建相册项
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: filePreview.title,
            description: filePreview.description,
            imagePath: uploadResult.url,
            category: filePreview.category || undefined,
            tags: filePreview.tags,
            isPublic: filePreview.isPublic,
            mimeType: filePreview.file.type,
            fileSize: filePreview.file.size,
            ...uploadResult.exif,
            location: selectedLocation || filePreview.location || uploadResult.exif.location || undefined,
            takenAt: finalTakenAt
          })
        })

        if (!response.ok) {
          throw new Error(`上传 ${filePreview.file.name} 失败`)
        }
      }

      files.forEach(file => { URL.revokeObjectURL(file.preview) })
      setFiles([])

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('上传失败:', error)

      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试'
      alert(`上传失败: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      files.forEach(file => { URL.revokeObjectURL(file.preview) })
      setFiles([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传照片</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">拖拽照片到这里或点击选择</p>
              <p className="text-sm text-gray-500">支持 JPG、PNG、WebP、GIF 格式，最大50MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => { void handleFileSelect(e.target.files) }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" >
                <Button variant="outline" className="cursor-pointer mt-4" asChild>
                  <span>选择文件</span>
                </Button>
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-6">
                {files.map((filePreview, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* 图片预览 */}
                      <div className="relative w-24 h-24 shrink-0">
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={filePreview.preview}
                            alt={filePreview.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => { removeFile(index) }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow"
                          aria-label="移除"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* 文件信息编辑 */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`title-${index}`}>标题 *</Label>
                            <Input
                              id={`title-${index}`}
                              value={filePreview.title}
                              onChange={(e) => {
                                updateFile(index, {
                                  title: e.target.value,
                                  errors: {
                                    ...filePreview.errors,
                                    title: false
                                  }
                                })
                              }}
                              placeholder="照片标题"
                              className={filePreview.errors?.title ? 'border-red-500 focus:border-red-500' : ''}
                              required
                            />
                            {filePreview.errors?.title && (
                              <p className="text-sm text-red-500">请填写照片标题</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`category-${index}`}>分类</Label>
                            <Input
                              id={`category-${index}`}
                              value={filePreview.category}
                              onChange={(e) => { updateFile(index, { category: e.target.value }) }}
                              placeholder="如：旅行、生活、摄影"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`description-${index}`}>描述</Label>
                          <Textarea
                            id={`description-${index}`}
                            value={filePreview.description}
                            onChange={(e) => { updateFile(index, { description: e.target.value }) }}
                            placeholder="照片描述..."
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`tags-${index}`}>标签</Label>
                            <Input
                              id={`tags-${index}`}
                              value={filePreview.tags.join(', ')}
                              onChange={(e) => { updateFile(index, { tags: parseTags(e.target.value) }) }}
                              placeholder="标签1, 标签2, 标签3"
                            />
                          </div>
                          <div className="space-y-2">
                            <DateTimePicker
                              label="拍摄时间"
                              value={filePreview.takenAt}
                              onChange={(date) => {
                                updateFile(index, {
                                  takenAt: date,
                                  errors: {
                                    ...filePreview.errors,
                                    takenAt: false
                                  }
                                })
                              }}
                              placeholder="选择拍摄日期和时间"
                              error={filePreview.errors?.takenAt}
                              required
                            />
                            {filePreview.errors?.takenAt && (
                              <p className="text-sm text-red-500">请填写拍摄时间</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                            <div className="space-y-2">
                              <Label>国家  <span className="text-red-500">*</span></Label>
                              <Select
                                value={filePreview.country ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, {
                                    country: val || undefined,
                                    province: undefined,
                                    city: undefined,
                                    errors: {
                                      ...filePreview.errors,
                                      country: false,
                                      province: false,
                                      city: false
                                    }
                                  })
                                }}
                                required
                              >
                                <SelectTrigger className={filePreview.errors?.country ? 'border-red-500 focus:border-red-500' : ''}>
                                  <SelectValue placeholder="选择国家" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCountries().map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {filePreview.errors?.country && (
                                <p className="text-sm text-red-500">请选择国家</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>省/州  <span className="text-red-500">*</span></Label>
                              <Select
                                value={filePreview.province ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, {
                                    province: val || undefined,
                                    city: undefined,
                                    errors: {
                                      ...filePreview.errors,
                                      province: false,
                                      city: false
                                    }
                                  })
                                }}
                                disabled={!filePreview.country}
                                required
                              >
                                <SelectTrigger className={filePreview.errors?.province ? 'border-red-500 focus:border-red-500' : ''}>
                                  <SelectValue placeholder="选择省/州" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getProvinces(filePreview.country).map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {filePreview.errors?.province && (
                                <p className="text-sm text-red-500">请选择省/州</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>市/地区  <span className="text-red-500">*</span></Label>
                              <Select
                                value={filePreview.city ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, {
                                    city: val || undefined,
                                    errors: {
                                      ...filePreview.errors,
                                      city: false
                                    }
                                  })
                                }}
                                disabled={!filePreview.country || !filePreview.province}
                                required
                              >
                                <SelectTrigger className={filePreview.errors?.city ? 'border-red-500 focus:border-red-500' : ''}>
                                  <SelectValue placeholder="选择市/地区" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCities(filePreview.country, filePreview.province).map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {filePreview.errors?.city && (
                                <p className="text-sm text-red-500">请选择市/地区</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`public-${index}`}
                            checked={filePreview.isPublic}
                            onCheckedChange={(checked) => { updateFile(index, { isPublic: checked }) }}
                          />
                          <Label htmlFor={`public-${index}`}>公开显示</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? '上传中...' : `上传 (${files.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GalleryUploadDialog
