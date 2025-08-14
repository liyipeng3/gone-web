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
}

const GalleryUploadDialog: React.FC<GalleryUploadDialogProps> = ({
  open,
  onOpenChange
}) => {
  const router = useRouter()
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FilePreview[] = []

    Array.from(selectedFiles).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
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
          city: undefined
        })
      }
    })

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
    handleFileSelect(e.dataTransfer.files)
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

  // 处理上传
  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      for (const filePreview of files) {
        // 上传文件
        const uploadResult = await uploadFileToServer(filePreview.file)

        // 如果选择了国家/省/市，拼装位置字符串
        const selectedLocation = [filePreview.country, filePreview.province, filePreview.city]
          .filter(Boolean)
          .join(' · ')

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
            // 先展开 EXIF，再用下方 location 覆盖
            ...uploadResult.exif,
            // 优先级：国家省市选择 > 手动输入 > EXIF
            location: selectedLocation || filePreview.location || uploadResult.exif.location || undefined
          })
        })

        if (!response.ok) {
          throw new Error(`上传 ${filePreview.file.name} 失败`)
        }
      }

      // 清理预览URL
      files.forEach(file => { URL.revokeObjectURL(file.preview) })
      setFiles([])

      // 关闭对话框并刷新页面
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('上传失败:', error)

      // 显示详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试'
      alert(`上传失败: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  // 关闭对话框时清理资源
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
          {/* 文件选择区域 */}
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
                onChange={(e) => { handleFileSelect(e.target.files) }}
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

          {/* 文件预览和编辑 */}
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
                            <Label htmlFor={`title-${index}`}>标题</Label>
                            <Input
                              id={`title-${index}`}
                              value={filePreview.title}
                              onChange={(e) => { updateFile(index, { title: e.target.value }) }}
                              placeholder="照片标题"
                            />
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                            <div className="space-y-2">
                              <Label>国家</Label>
                              <Select
                                value={filePreview.country ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, { country: val || undefined, province: undefined, city: undefined })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择国家" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCountries().then(countries => countries.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  )))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>省/州</Label>
                              <Select
                                value={filePreview.province ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, { province: val || undefined, city: undefined })
                                }}
                                disabled={!filePreview.country}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择省/州" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getProvinces(filePreview.country).then(provinces => provinces.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  )))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>市/地区</Label>
                              <Select
                                value={filePreview.city ?? ''}
                                onValueChange={(val) => {
                                  updateFile(index, { city: val || undefined })
                                }}
                                disabled={!filePreview.country || !filePreview.province}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择市/地区" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCities(filePreview.country, filePreview.province).then(cities => cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                  )))}
                                </SelectContent>
                              </Select>
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
