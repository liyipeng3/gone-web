'use client'

import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
          isPublic: true
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

  // 模拟上传文件到服务器的函数
  const uploadFileToServer = async (file: File): Promise<string> => {
    // 这里应该实现实际的文件上传逻辑
    // 返回上传后的文件路径
    // 为了演示，我们使用 base64 URL（实际项目中应该上传到服务器或云存储）
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  // 处理上传
  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      for (const filePreview of files) {
        // 上传文件
        const imagePath = await uploadFileToServer(filePreview.file)

        // 创建相册项
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: filePreview.title,
            description: filePreview.description,
            imagePath,
            category: filePreview.category || undefined,
            tags: filePreview.tags,
            location: filePreview.location || undefined,
            isPublic: filePreview.isPublic,
            mimeType: filePreview.file.type,
            fileSize: filePreview.file.size
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
      alert('上传失败，请重试')
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
              <p className="text-sm text-gray-500">支持 JPG、PNG、WebP 格式</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => { handleFileSelect(e.target.files) }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>选择文件</span>
                </Button>
              </label>
            </div>
          </div>

          {/* 文件预览和编辑 */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">照片详情 ({files.length} 张)</h3>

              <div className="space-y-6">
                {files.map((filePreview, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* 图片预览 */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        <Image
                          src={filePreview.preview}
                          alt={filePreview.title}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => { removeFile(index) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* 文件信息编辑 */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`title-${index}`}>标题</Label>
                            <Input
                              id={`title-${index}`}
                              value={filePreview.title}
                              onChange={(e) => { updateFile(index, { title: e.target.value }) }}
                              placeholder="照片标题"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`category-${index}`}>分类</Label>
                            <Input
                              id={`category-${index}`}
                              value={filePreview.category}
                              onChange={(e) => { updateFile(index, { category: e.target.value }) }}
                              placeholder="如：旅行、生活、摄影"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${index}`}>描述</Label>
                          <Textarea
                            id={`description-${index}`}
                            value={filePreview.description}
                            onChange={(e) => { updateFile(index, { description: e.target.value }) }}
                            placeholder="照片描述..."
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`tags-${index}`}>标签</Label>
                            <Input
                              id={`tags-${index}`}
                              value={filePreview.tags.join(', ')}
                              onChange={(e) => { updateFile(index, { tags: parseTags(e.target.value) }) }}
                              placeholder="标签1, 标签2, 标签3"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`location-${index}`}>位置</Label>
                            <Input
                              id={`location-${index}`}
                              value={filePreview.location}
                              onChange={(e) => { updateFile(index, { location: e.target.value }) }}
                              placeholder="拍摄地点"
                            />
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
