'use client'

import React, { useCallback, useMemo, useState } from 'react'
import type { gallery } from '@prisma/client'
import Image from 'next/image'
import CustomImage from '@/components/common/image'
import Pagination from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit2, Trash2, Eye, EyeOff, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import GalleryEditDialog from './gallery-edit-dialog'
import GalleryDeleteDialog from './gallery-delete-dialog'
import GalleryDetailDialog from './gallery-detail-dialog'
import { defaultIcons } from '../common/prose/lightbox'

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
  onViewDetail: (item: gallery) => void
  onImageClick: (item: gallery) => void
}

const GalleryManagementItem = React.memo(function GalleryManagementItemComponent ({
  item,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewDetail,
  onImageClick
}: GalleryManagementItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const tags = item.tags ? JSON.parse(item.tags) : []

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      <div
        className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer"
        onClick={() => { onImageClick(item) }}
      >
        {!imageError && (
          <>
            <Image
              src={item.thumbnailPath ?? item.imagePath}
              alt={item.title ?? '相册图片'}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => { setImageLoaded(true) }}
              onError={() => { setImageError(true) }}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
          </>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <div className="text-2xl text-gray-400 mb-2">📷</div>
              <p className="text-sm text-gray-500">图片加载失败</p>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item) }}>
                <Edit2 className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility(item) }}>
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
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item) }}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!item.isPublic && (
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              私有
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 dark:border-gray-600"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onViewDetail(item) }}
            title="查看详情"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
            {item.title ?? '未命名'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
            #{item.gid}
          </span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
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

        <div className="space-y-1 pt-1">
          {item.category && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">分类:</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {item.category}
              </span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">标签:</span>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                    {index < Math.min(3, tags.length) - 1 && <span className="text-gray-400 dark:text-gray-500 mx-1">·</span>}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400  line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

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
  const [detailItem, setDetailItem] = useState<gallery | null>(null)
  const [detailIndex, setDetailIndex] = useState<number>(0)
  const [previewState, setPreviewState] = useState<{ open: boolean, index: number }>({ open: false, index: 0 })

  const handleEdit = useCallback((item: gallery) => {
    setEditingItem(item)
  }, [])

  const handleDelete = useCallback((item: gallery) => {
    setDeletingItem(item)
  }, [])

  const handleViewDetail = useCallback((item: gallery) => {
    const index = items.findIndex(i => i.gid === item.gid)
    setDetailItem(item)
    setDetailIndex(index)
  }, [items])

  const handleNavigate = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setDetailItem(items[index])
      setDetailIndex(index)
    }
  }, [items])

  const handleImageClick = useCallback((item: gallery) => {
    const index = items.findIndex(i => i.gid === item.gid)
    setPreviewState({ open: true, index })
  }, [items])

  const handleToggleVisibility = useCallback(async (item: gallery) => {
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
  }, [router])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {items.map((item) => (
          <GalleryManagementItem
            key={item.gid}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
            onViewDetail={handleViewDetail}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          pages={totalPages}
          current={currentPage}
          baseLink="/dashboard/gallery/page/"
        />
      )}

      {editingItem && (
        <GalleryEditDialog
          item={editingItem}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null)
          }}
        />
      )}

      {deletingItem && (
        <GalleryDeleteDialog
          item={deletingItem}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeletingItem(null)
          }}
        />
      )}

      <GalleryDetailDialog
        item={detailItem}
        open={detailItem !== null}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
        allItems={items}
        currentIndex={detailIndex}
        onNavigate={handleNavigate}
      />

      <CustomImage.PreviewGroup
        items={useMemo(() => items.map(item => item.imagePath), [items])}
        preview={{
          icons: defaultIcons,
          visible: previewState.open,
          onVisibleChange: (visible) => {
            setPreviewState(state => ({ ...state, open: visible }))
          },
          current: previewState.index,
          onChange: (current) => {
            setPreviewState(state => ({ ...state, index: current }))
          }
        }}
      >
      </CustomImage.PreviewGroup>
    </>
  )
}

export default GalleryManagementGrid
