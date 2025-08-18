'use client'

import React, { useState, useCallback } from 'react'
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
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onPreview, index }) => {
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
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div
        className="relative aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {!imageError && (
          <>
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

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
          <div className="w-full p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">

                {item.takenAt && (
                  <p className="text-white text-xs mt-1">
                    {dayjs(item.takenAt * 1000).format('YYYY-MM-DD')}
                  </p>
                )}
              </div>
              <button
                onClick={handlePreviewClick}
                className="ml-2 px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs transition-all duration-200 backdrop-blur-sm flex-shrink-0"
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

  const handlePreview = useCallback((src: string, index: number) => {
    setPreviewCurrent(index)
    setPreviewVisible(true)
  }, [])

  const previewImages = items.map(item => item.imagePath)

  return (
    <>
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
          onChange: (current: number) => { setPreviewCurrent(current) },
          toolbarRender: (originalNode, { current: currentIndex }) => {
            const currentItem = items[currentIndex]
            return (
              <div className="flex flex-col items-center">
                {originalNode}
                {currentItem && (
                  <div className="mt-4 p-4 bg-black bg-opacity-50 rounded-lg text-white text-sm max-w-md">
                    <h3 className="font-medium mb-2">{currentItem.title ?? '未命名'}</h3>
                    {currentItem.description && (
                      <p className="text-gray-300 mb-2">{currentItem.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {currentItem.camera && (
                        <div><span className="text-gray-400">相机:</span> {currentItem.camera}</div>
                      )}
                      {currentItem.lens && (
                        <div><span className="text-gray-400">镜头:</span> {currentItem.lens}</div>
                      )}
                      {currentItem.focalLength && (
                        <div><span className="text-gray-400">焦距:</span> {currentItem.focalLength}</div>
                      )}
                      {currentItem.aperture && (
                        <div><span className="text-gray-400">光圈:</span> {currentItem.aperture}</div>
                      )}
                      {currentItem.shutterSpeed && (
                        <div><span className="text-gray-400">快门:</span> {currentItem.shutterSpeed}</div>
                      )}
                      {currentItem.iso && (
                        <div><span className="text-gray-400">ISO:</span> {currentItem.iso}</div>
                      )}
                      {currentItem.width && currentItem.height && (
                        <div><span className="text-gray-400">尺寸:</span> {currentItem.width}×{currentItem.height}</div>
                      )}
                      {currentItem.location && (
                        <div className="col-span-2"><span className="text-gray-400">位置:</span> {currentItem.location}</div>
                      )}
                    </div>
                    {currentItem.tags && JSON.parse(currentItem.tags).length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-400">标签: </span>
                        {JSON.parse(currentItem.tags).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-600 bg-opacity-50 px-2 py-1 rounded-full mr-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }
        }}
      />
    </>
  )
}

export default GalleryGrid
