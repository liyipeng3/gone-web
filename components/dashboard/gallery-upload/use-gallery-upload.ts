'use client'

import { type DragEvent, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type FilePreview,
  readExifData,
  uploadFileToServer,
  validateFilePreviews
} from './gallery-upload-utils'

interface UseGalleryUploadOptions {
  onClose: () => void
}

/**
 * 封装相册上传的状态与处理逻辑（文件选择、拖拽、校验、上传）。
 */
export const useGalleryUpload = ({ onClose }: UseGalleryUploadOptions) => {
  const router = useRouter()
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FilePreview[] = []

    for (const file of Array.from(selectedFiles)) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        const takenAt = await readExifData(file)

        newFiles.push({
          file,
          preview,
          title: file.name.replace(/\.[^/.]+$/, ''),
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

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }, [])

  const updateFile = useCallback((index: number, updates: Partial<FilePreview>) => {
    setFiles(prev => {
      const newFiles = [...prev]
      newFiles[index] = { ...newFiles[index], ...updates }
      return newFiles
    })
  }, [])

  const resetFiles = useCallback(() => {
    setFiles(prev => {
      prev.forEach(file => { URL.revokeObjectURL(file.preview) })
      return []
    })
  }, [])

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return

    const { files: validatedFiles, valid } = validateFilePreviews(files)
    if (!valid) {
      setFiles(validatedFiles)
      return
    }

    setUploading(true)

    try {
      for (const filePreview of files) {
        const uploadResult = await uploadFileToServer(filePreview.file)

        const selectedLocation = [filePreview.country, filePreview.province, filePreview.city]
          .filter(Boolean)
          .join(' · ')

        const finalTakenAt = filePreview.takenAt
          ? Math.floor(filePreview.takenAt.getTime() / 1000)
          : uploadResult.exif.takenAt

        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: filePreview.title,
            description: filePreview.description,
            imagePath: uploadResult.url,
            thumbnailPath: uploadResult.thumbnailUrl ?? undefined,
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

      resetFiles()
      onClose()
      router.refresh()
    } catch (error) {
      console.error('上传失败:', error)
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试'
      alert(`上传失败: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }, [files, onClose, resetFiles, router])

  return {
    files,
    uploading,
    dragOver,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    updateFile,
    resetFiles,
    handleUpload
  }
}
