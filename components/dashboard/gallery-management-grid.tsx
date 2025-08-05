'use client'

import React, { useState } from 'react'
import type { gallery } from '@prisma/client'
import Image from 'next/image'
import Pagination from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import GalleryEditDialog from './gallery-edit-dialog'
import GalleryDeleteDialog from './gallery-delete-dialog'

interface GalleryManagementGridProps {
  items: gallery[]
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
}

interface GalleryManagementItemProps {
  item: gallery
  onEdit: (item: gallery) => void
  onDelete: (item: gallery) => void
  onToggleVisibility: (item: gallery) => void
}

// 单个相册管理项组件
const GalleryManagementItem: React.FC<GalleryManagementItemProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleVisibility
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // 解析标签
  const tags = item.tags ? JSON.parse(item.tags) : []

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 图片容器 */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {!imageError && (
          <>
            <Image
              src={item.thumbnailPath ?? item.imagePath}
              alt={item.title ?? '相册图片'}
              fill
              className={`object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => { setImageLoaded(true) }}
              onError={() => { setImageError(true) }}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* 加载骨架屏 */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
          </>
        )}

        {/* 图片加载失败 */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <div className="text-2xl text-gray-400 mb-2">📷</div>
              <p className="text-sm text-gray-500">图片加载失败</p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { onEdit(item) }}>
                <Edit2 className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onToggleVisibility(item) }}>
                {item.isPublic
                  ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    设为私有
                  </>
                    )
                  : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    设为公开
                  </>
                    )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { onDelete(item) }}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 可见性标识 */}
        {!item.isPublic && (
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              私有
            </div>
          </div>
        )}
      </div>

      {/* 图片信息 */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
            {item.title ?? '未命名'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
            #{item.gid}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* 分类和标签 */}
        <div className="space-y-1 mb-2">
          {item.category && (
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">分类: </span>
              <span className="text-blue-600 dark:text-blue-400">{item.category}</span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 元数据 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>尺寸</span>
            <span>{item.width && item.height ? `${item.width}×${item.height}` : '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span>创建时间</span>
            <span>{formatDate(item.createdAt * 1000)}</span>
          </div>
          {item.takenAt && (
            <div className="flex justify-between">
              <span>拍摄时间</span>
              <span>{formatDate(item.takenAt * 1000)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 相册管理网格组件
const GalleryManagementGrid: React.FC<GalleryManagementGridProps> = ({
  items,
  total,
  currentPage,
  totalPages,
  pageSize
}) => {
  const router = useRouter()
  const [editingItem, setEditingItem] = useState<gallery | null>(null)
  const [deletingItem, setDeletingItem] = useState<gallery | null>(null)

  // 处理编辑
  const handleEdit = (item: gallery) => {
    setEditingItem(item)
  }

  // 处理删除
  const handleDelete = (item: gallery) => {
    setDeletingItem(item)
  }

  // 处理可见性切换
  const handleToggleVisibility = async (item: gallery) => {
    try {
      const response = await fetch(`/api/gallery/${item.gid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: !item.isPublic
        })
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error('更新可见性失败')
      }
    } catch (error) {
      console.error('更新可见性失败:', error)
    }
  }

  return (
    <>
      {/* 相册网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {items.map((item) => (
          <GalleryManagementItem
            key={item.gid}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
          />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination
          pages={totalPages}
          current={currentPage}
          baseLink="/dashboard/gallery/page/"
        />
      )}

      {/* 编辑对话框 */}
      {editingItem && (
        <GalleryEditDialog
          item={editingItem}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null)
          }}
        />
      )}

      {/* 删除对话框 */}
      {deletingItem && (
        <GalleryDeleteDialog
          item={deletingItem}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeletingItem(null)
          }}
        />
      )}
    </>
  )
}

export default GalleryManagementGrid
