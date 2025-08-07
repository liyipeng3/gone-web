'use client'

import React, { useState, useCallback } from 'react'
import type { gallery } from '@prisma/client'
import Image from 'next/image'
import Pagination from '@/components/common/pagination'
import ImagePreview from '@/components/common/image'
import { formatDate } from '@/lib/utils'
import { defaultIcons } from '../prose/lightbox'

interface GalleryGridProps {
  items: gallery[]
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  basePath?: string
}

interface GalleryItemProps {
  item: gallery
  onPreview: (src: string, index: number) => void
  index: number
}

// 单个相册项组件
const GalleryItem: React.FC<GalleryItemProps> = ({ item, onPreview, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleClick = useCallback(() => {
    onPreview(item.imagePath, index)
  }, [item.imagePath, index, onPreview])

  // 解析标签
  const tags = item.tags ? JSON.parse(item.tags) : []

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* 图片容器 */}
      <div
        className="relative aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {!imageError && (
          <>
            {/* 缩略图或原图 */}
            <Image
              src={item.thumbnailPath ?? item.imagePath}
              alt={item.title ?? '相册图片'}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
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

        {/* 悬浮信息层 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
          <div className="w-full p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.camera && (
              <p className="text-white text-xs truncate">📸 {item.camera}</p>
            )}
            {item.takenAt && (
              <p className="text-white text-xs mt-1">
                📅 {formatDate(item.takenAt * 1000)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 图片信息 */}
      <div className="p-3">
        {item.title && (
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
            {item.title}
          </h3>
        )}

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 元数据 */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {item.width && item.height && `${item.width}×${item.height}`}
          </span>
          {item.location && (
            <span className="truncate ml-2">📍 {item.location}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// 相册网格组件
const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  total,
  currentPage,
  totalPages,
  pageSize,
  basePath = '/gallery'
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewCurrent, setPreviewCurrent] = useState(0)

  // 处理图片预览
  const handlePreview = useCallback((src: string, index: number) => {
    setPreviewCurrent(index)
    setPreviewVisible(true)
  }, [])

  // 准备预览图片列表
  const previewImages = items.map(item => item.imagePath)

  return (
    <>
      {/* 相册网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {items.map((item, index) => (
          <GalleryItem
            key={item.gid}
            item={item}
            onPreview={handlePreview}
            index={index}
          />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination
          pages={totalPages}
          current={currentPage}
          baseLink={basePath === '/gallery' ? '/gallery/page/' : `${basePath}/page/`}
        />
      )}

      {/* 图片预览 */}
      <ImagePreview.PreviewGroup
        items={previewImages}
        preview={{
          icons: defaultIcons,
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          current: previewCurrent,
          onChange: (current: number) => { setPreviewCurrent(current) }
        }}
      />
    </>
  )
}

export default GalleryGrid
