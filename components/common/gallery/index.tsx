'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { gallery } from '@prisma/client'
import Image from 'next/image'
import Pagination from '@/components/common/pagination'
import ImagePreview from '@/components/common/image'
import { defaultIcons } from '../prose/lightbox'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

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
  style?: React.CSSProperties
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onPreview, index, style }) => {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleClick = useCallback(() => {
    router.push(`/gallery/photo/${item.gid}`)
  }, [router, item.gid])

  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview(item.imagePath, index)
  }, [item.imagePath, index, onPreview])

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-4"
      style={style}
    >
      <div
        className="relative bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {!imageError && (
          <>
            <Image
              src={item.thumbnailPath ?? item.imagePath}
              alt={item.title ?? '相册图片'}
              width={item.width ?? 1200}
              height={item.height ?? 800}
              className={`w-full h-auto object-cover transition-all duration-300 group-hover:scale-[1.02] ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
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

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end pointer-events-none">
          <div className="w-full p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">

                {item.takenAt && (
                  <p className="text-white text-xs mt-1">
                    {dayjs(item.takenAt).format('YYYY-MM-DD')}
                  </p>
                )}
              </div>
              <button
                onClick={handlePreviewClick}
                className="ml-2 px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs transition-all duration-200 backdrop-blur-sm flex-shrink-0 pointer-events-auto"
              >
                🔍 预览
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [itemPositions, setItemPositions] = useState<Array<{ left: number, top: number }>>([])
  const [containerHeight, setContainerHeight] = useState(0)

  const getColumnCount = useCallback(() => {
    if (!containerRef.current) return 3
    const width = containerRef.current.offsetWidth
    if (width < 768) return 2 // md以下：2列
    if (width < 1280) return 3
    if (width < 1536) return 4
    return 5
  }, [])

  const calculateLayout = useCallback(() => {
    if (!containerRef.current || items.length === 0) return

    const columnCount = getColumnCount()
    const containerWidth = containerRef.current.offsetWidth
    const gap = containerWidth > 1280 ? 24 : containerWidth > 768 ? 20 : 16
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount

    const heights = new Array(columnCount).fill(0)
    const positions: Array<{ left: number, top: number }> = []

    items.forEach((item) => {
      const minHeightIndex = heights.indexOf(Math.min(...heights))

      const aspectRatio = (item.height && item.width) ? item.height / item.width : 0.75
      const imageHeight = columnWidth * aspectRatio
      const cardHeight = imageHeight

      positions.push({
        left: minHeightIndex * (columnWidth + gap),
        top: heights[minHeightIndex]
      })

      heights[minHeightIndex] += cardHeight + gap
    })

    setItemPositions(positions)
    setContainerHeight(Math.max(...heights))
  }, [items, getColumnCount])

  useEffect(() => {
    const handleResize = () => {
      calculateLayout()
    }

    calculateLayout()
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize) }
  }, [calculateLayout])

  const handlePreview = useCallback((src: string, index: number) => {
    setPreviewCurrent(index)
    setPreviewVisible(true)
  }, [])

  const previewImages = items.map(item => item.imagePath)

  return (
    <>
      <div
        ref={containerRef}
        className="relative mb-8"
        style={{ height: containerHeight }}
      >
        {items.map((item, index) => {
          const position = itemPositions[index]
          if (!position) return null

          const columnCount = getColumnCount()
          const containerWidth = containerRef.current?.offsetWidth ?? 1200
          const gap = containerWidth > 1280 ? 24 : containerWidth > 768 ? 20 : 16
          const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount

          return (
            <GalleryItem
              key={item.gid}
              item={item}
              onPreview={handlePreview}
              index={index}
              style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                width: columnWidth,
                transition: 'all 0.3s ease'
              }}
            />
          )
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          pages={totalPages}
          current={currentPage}
          baseLink={basePath === '/gallery' ? '/gallery/page/' : `${basePath}/page/`}
        />
      )}

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
