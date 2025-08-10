'use client'

import React, { useEffect } from 'react'
import type { gallery } from '@prisma/client'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { Calendar, Camera, MapPin, Info, Eye, EyeOff } from 'lucide-react'

interface GalleryDetailDialogProps {
  item: gallery | null
  open: boolean
  onOpenChange: (open: boolean) => void
  allItems?: gallery[]
  currentIndex?: number
  onNavigate?: (index: number) => void
}

const GalleryDetailDialog: React.FC<GalleryDetailDialogProps> = ({
  item,
  open,
  onOpenChange,
  allItems = [],
  currentIndex = 0,
  onNavigate
}) => {
  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只在详情弹窗打开时处理键盘事件
      if (!open) return

      if (allItems.length > 1 && onNavigate) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1
          onNavigate(prevIndex)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0
          onNavigate(nextIndex)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, currentIndex, allItems.length, onNavigate])

  if (!item) return null

  // 解析标签
  const tags = item.tags ? JSON.parse(item.tags) : []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              图片详情
              {allItems.length > 1 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ( {currentIndex + 1} / {allItems.length} )
                </span>
              )}
              {!item.isPublic && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                  <EyeOff className="h-3 w-3 mr-1" />
                  私有
                </span>
              )}
              {item.isPublic && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  <Eye className="h-3 w-3 mr-1" />
                  公开
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 图片预览 */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={item.imagePath}
                  alt={item.title ?? '相册图片'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* 导航按钮 */}
              {allItems.length > 1 && onNavigate && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1
                      onNavigate(prevIndex)
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="上一张"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    上一张
                  </button>
                  <button
                    onClick={() => {
                      const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0
                      onNavigate(nextIndex)
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="下一张"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    下一张
                  </button>
                </div>
              )}

              {/* 基本信息 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title ?? '未命名'}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>

              {/* 分类和标签 */}
              <div className="space-y-3">
                {item.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">标签</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.map((tag: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 详细信息 */}
            <div className="space-y-6">
              {/* 文件信息 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  文件信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">ID</span>
                    <div className="font-mono">#{item.gid}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">尺寸</span>
                    <div>{item.width && item.height ? `${item.width}×${item.height}` : '未知'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">文件大小</span>
                    <div>
                      {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : '未知'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">文件类型</span>
                    <div>{item.mimeType ?? '未知'}</div>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  时间信息
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">创建时间</span>
                    <span>{formatDate(item.createdAt * 1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">更新时间</span>
                    <span>{formatDate(item.updatedAt * 1000)}</span>
                  </div>
                  {item.takenAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">拍摄时间</span>
                      <span>{formatDate(item.takenAt * 1000)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* EXIF 信息 */}
              {(item.camera ?? item.aperture ?? item.iso ?? item.focalLength) && (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    EXIF 信息
                  </h4>
                  <div className="space-y-2 text-sm">
                    {item.camera && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">相机</span>
                        <span className="text-right max-w-[200px] truncate">{item.camera}</span>
                      </div>
                    )}
                    {item.lens && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">镜头</span>
                        <span className="text-right max-w-[200px] truncate">{item.lens}</span>
                      </div>
                    )}
                    {item.focalLength && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">焦距</span>
                        <span>{item.focalLength}</span>
                      </div>
                    )}
                    {item.aperture && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">光圈</span>
                        <span>{item.aperture}</span>
                      </div>
                    )}
                    {item.shutterSpeed && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">快门速度</span>
                        <span>{item.shutterSpeed}</span>
                      </div>
                    )}
                    {item.iso && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ISO</span>
                        <span>{item.iso}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 位置信息 */}
              {(item.location ?? item.latitude) && (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    位置信息
                  </h4>
                  <div className="space-y-2 text-sm">
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">地点</span>
                        <span className="text-right max-w-[200px] truncate">{item.location}</span>
                      </div>
                    )}
                    {item.latitude && item.longitude && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">GPS 坐标</span>
                        <span className="text-right font-mono text-xs">
                          {Number(item.latitude).toFixed(6)}, {Number(item.longitude).toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GalleryDetailDialog
