'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { useGalleryUpload } from './gallery-upload/use-gallery-upload'
import GalleryUploadFileCard from './gallery-upload/gallery-upload-file-card'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GalleryUploadDialog: React.FC<GalleryUploadDialogProps> = ({
  open,
  onOpenChange
}) => {
  const {
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
  } = useGalleryUpload({ onClose: () => { onOpenChange(false) } })

  const handleClose = () => {
    if (!uploading) {
      resetFiles()
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
                  <GalleryUploadFileCard
                    key={index}
                    filePreview={filePreview}
                    index={index}
                    onRemove={removeFile}
                    onUpdate={updateFile}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              取消
            </Button>
            <Button
              onClick={() => { void handleUpload() }}
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
