'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { gallery } from '@prisma/client'
import ImagePreview from '@/components/common/image'
import { defaultIcons } from '../prose/lightbox'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import ProgressiveImage from '../image/ProgressiveImage'

interface GalleryGridProps {
  items: gallery[]
  total: number
  pageSize: number
  category?: string
  tag?: string
}

interface GalleryItemProps {
  item: gallery
  onPreview: (src: string, index: number) => void
  index: number
  style?: React.CSSProperties
}

// 图片进入视口才加载：提前 200px 触发，首次进入后停止观察并保持挂载，避免回滚时闪烁
const ITEM_OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: '200px' }
// 触底加载提前量，给网络请求留出缓冲
const LOAD_MORE_OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: '400px' }

function useInView<T extends Element> (
  options: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, options)
    observer.observe(el)
    return () => { observer.disconnect() }
  }, [inView, options])

  return [ref, inView]
}

const GalleryItem: React.FC<GalleryItemProps> = React.memo(({ item, onPreview, index, style }) => {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [cardRef, inView] = useInView<HTMLDivElement>(ITEM_OBSERVER_OPTIONS)

  const handleClick = useCallback(() => {
    router.push(`/gallery/photo/${item.gid}`)
  }, [router, item.gid])

  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview(item.imagePath, index)
  }, [item.imagePath, index, onPreview])

  const cardHeight = Number(style?.width ?? 1200) * (item.height ?? 800) / (item.width ?? 1200)

  return (
    <div
      ref={cardRef}
      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-4"
      style={{ ...style, height: cardHeight }}
    >
      <div
        className="relative bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {!inView && (
          <div
            className="w-full bg-gray-100 dark:bg-gray-700 animate-pulse"
            style={{ height: cardHeight }}
          />
        )}

        {inView && !imageError && (
          <ProgressiveImage
            src={item.imagePath}
            thumbnailSrc={item.thumbnailPath ?? ''}
            alt={item.title ?? '相册图片'}
            preview={false}
            className={'w-full h-auto object-cover transition-all duration-300 group-hover:scale-[1.02]'}
            onError={() => { setImageError(true) }}
            style={{
              height: cardHeight
            }}
          />
        )}

        {inView && imageError && (
          <div
            className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700"
            style={{ height: cardHeight }}
          >
            <div className="text-center">
              <div className="text-2xl text-gray-400 mb-2">📷</div>
              <p className="text-sm text-gray-500">图片加载失败</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end pointer-events-none">
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
                className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-all duration-200 backdrop-blur-sm shrink-0 pointer-events-auto"
              >
                🔍 预览
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

GalleryItem.displayName = 'GalleryItem'

const GalleryWaterfall: React.FC<GalleryGridProps> = ({
  items,
  total,
  pageSize,
  category,
  tag
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewCurrent, setPreviewCurrent] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [itemPositions, setItemPositions] = useState<Array<{ left: number, top: number }>>([])
  const [containerHeight, setContainerHeight] = useState(0)

  // 累积已加载数据（首屏由 SSR 提供）
  const [loadedItems, setLoadedItems] = useState<gallery[]>(items)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  // 服务端已读取的记录数，作为下一次查询的 offset
  const offsetRef = useRef(items.length)

  const hasMore = loadedItems.length < total

  const getColumnCount = useCallback(() => {
    if (!containerRef.current) return 3
    const width = containerRef.current.offsetWidth
    if (width < 768) return 2 // md以下：2列
    if (width < 1280) return 3
    if (width < 1536) return 4
    return 5
  }, [])

  const calculateLayout = useCallback(() => {
    if (!containerRef.current || loadedItems.length === 0) return

    const columnCount = getColumnCount()
    const containerWidth = containerRef.current.offsetWidth
    const gap = containerWidth > 1280 ? 24 : containerWidth > 768 ? 20 : 16
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount

    const heights = new Array(columnCount).fill(0)
    const positions: Array<{ left: number, top: number }> = []

    loadedItems.forEach((item) => {
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
  }, [loadedItems, getColumnCount])

  useEffect(() => {
    const handleResize = () => {
      calculateLayout()
    }

    calculateLayout()
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize) }
  }, [calculateLayout])

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offsetRef.current),
        orderBy: 'takenAt',
        orderDirection: 'desc'
      })
      if (category) params.set('category', category)
      if (tag) params.set('tag', tag)

      const res = await fetch(`/api/gallery?${params.toString()}`)
      if (!res.ok) throw new Error(`加载失败: ${res.status}`)
      const data = await res.json() as { items: gallery[], total: number }

      offsetRef.current += data.items.length

      setLoadedItems((prev) => {
        // 稳定排序下通常无重复，仍按 gid 去重作为防御
        const existing = new Set(prev.map((it) => it.gid))
        const appended = data.items.filter((it) => !existing.has(it.gid))
        return appended.length > 0 ? [...prev, ...appended] : prev
      })
    } catch (error) {
      console.error('加载更多相册失败:', error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [category, tag, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        void loadMore()
      }
    }, LOAD_MORE_OBSERVER_OPTIONS)
    observer.observe(el)
    return () => { observer.disconnect() }
  }, [hasMore, loadMore])

  const handlePreview = useCallback((_src: string, index: number) => {
    setPreviewCurrent(index)
    setPreviewVisible(true)
  }, [])

  const previewImages = useMemo(() => loadedItems.map(item => item.imagePath), [loadedItems])

  return (
    <>
      <div
        ref={containerRef}
        className="relative mb-8"
        style={{ height: containerHeight }}
      >
        {loadedItems.map((item, index) => {
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

      {hasMore && <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />}

      {loading && (
        <div className="text-center py-6 text-gray-400 text-sm">加载中…</div>
      )}

      {!hasMore && loadedItems.length > 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">没有更多了</div>
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

export default GalleryWaterfall
