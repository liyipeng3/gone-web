'use client'

import React, { useState } from 'react'
import type { gallery } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface GalleryDeleteDialogProps {
  item: gallery
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GalleryDeleteDialog: React.FC<GalleryDeleteDialogProps> = ({
  item,
  open,
  onOpenChange
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 处理删除
  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/gallery/${item.gid}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除相册项失败:', error)
      alert('删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            确认删除
          </DialogTitle>
          <DialogDescription>
            此操作无法撤销。照片将从相册中永久删除。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 照片预览 */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
              <Image
                src={item.thumbnailPath ?? item.imagePath}
                alt={item.title ?? '照片'}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.title ?? '未命名'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{item.gid}
              </p>
              {item.category && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {item.category}
                </p>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => { onOpenChange(false) }}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GalleryDeleteDialog
