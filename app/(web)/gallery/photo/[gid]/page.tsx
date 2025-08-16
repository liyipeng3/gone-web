import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getGalleryById, getAdjacentPhotos } from '@/models/gallery'
import KeyboardNavigation from '@/components/common/photo-navigation/keyboard-navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { getCameraBrand, formatCameraModel } from '@/lib/camera-brands'

interface PhotoDetailPageProps {
  params: {
    gid: string
  }
  searchParams: {
    category?: string
  }
}

// 动态生成页面元数据
export async function generateMetadata ({ params }: PhotoDetailPageProps): Promise<Metadata> {
  const gid = parseInt(params.gid)
  if (isNaN(gid)) return { title: '照片详情' }

  const photo = await getGalleryById(gid)
  if (!photo?.isPublic) return { title: '照片详情' }

  return {
    title: `${photo.title ?? '未命名照片'} - 相册`,
    description: photo.description ?? '查看照片详细信息和 EXIF 数据',
    openGraph: {
      title: photo.title ?? '未命名照片',
      description: photo.description ?? '',
      images: [photo.imagePath],
      type: 'website'
    }
  }
}

// 格式化日期时间
function formatDateTime (timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function PhotoDetailPage ({ params, searchParams }: PhotoDetailPageProps) {
  const gid = parseInt(params.gid)

  if (isNaN(gid)) {
    notFound()
  }

  const [photo, adjacentPhotos] = await Promise.all([
    getGalleryById(gid),
    getAdjacentPhotos(gid, searchParams.category)
  ])

  if (!photo) {
    notFound()
  }

  // 如果照片是私有的，重定向到相册页面
  if (!photo.isPublic) {
    redirect('/gallery')
  }

  // 解析标签
  const tags = photo.tags ? JSON.parse(photo.tags) : []

  return (
    <div className="w-full mx-auto px-4 pb-10 pt-3 relative">
      {/* 键盘导航 */}
      <KeyboardNavigation
        previousUrl={adjacentPhotos.previous ? `/gallery/photo/${adjacentPhotos.previous.gid}${photo.category ? `?category=${photo.category}` : ''}` : undefined}
        nextUrl={adjacentPhotos.next ? `/gallery/photo/${adjacentPhotos.next.gid}${photo.category ? `?category=${photo.category}` : ''}` : undefined}
      />
      {/*
      <Breadcrumb
        className="text-left"
        items={[
          { name: '相册', href: '/gallery' },
          ...(photo.category ? [{ name: photo.category, href: `/gallery/${photo.category}` }] : []),
          { name: photo.title ?? '照片详情', href: `/gallery/photo/${photo.gid}` }
        ]}
      /> */}

      <div className="space-y-8 mt-6">
        {/* 图片展示区域 */}
        <div className="w-full">
          <div className=" rounded-lg  overflow-hidden">
            <div className="relative w-full   h-[85vh]  ">
              <Image
                src={photo.thumbnailPath ?? photo.imagePath}
                alt={photo.title ?? '照片'}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>

            {/* 图片标题和描述 */}
            <div className="p-6">
              {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {photo.title ?? '未命名照片'}
              </h1> */}
              {photo.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-4">
                  {photo.description}
                </p>
              )}

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 左右导航按钮 */}
        {adjacentPhotos.previous && (
          <Link
            href={`/gallery/photo/${adjacentPhotos.previous.gid}${photo.category ? `?category=${photo.category}` : ''}`}
            className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 transform z-20 bg-black/30 hover:bg-black/60 text-white px-2 py-8 sm:px-3 sm:py-12 rounded transition-all duration-200 opacity-50 hover:opacity-80 shadow-md backdrop-blur-sm dark:bg-gray-800"
            title="上一张 (←)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        )}

        {adjacentPhotos.next && (
          <Link
            href={`/gallery/photo/${adjacentPhotos.next.gid}${photo.category ? `?category=${photo.category}` : ''}`}
            className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 transform z-20 bg-black/30 hover:bg-black/60 text-white px-2 py-8 sm:px-3 sm:py-12 rounded transition-all duration-200 opacity-50 hover:opacity-80 shadow-md backdrop-blur-sm dark:bg-gray-800"
            title="下一张 (→)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-8 text-sm text-gray-600 dark:text-gray-400">

          {photo.camera && (() => {
            const brand = getCameraBrand(photo.camera)
            return (
              <div className="flex items-center gap-2">
                {brand
                  ? (
                    <>
                      <div className="w-24 h-10 relative">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-medium">{formatCameraModel(photo.camera)}</span>
                    </>
                    )
                  : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span className="font-medium">{photo.camera}</span>
                    </>
                    )}
              </div>
            )
          })()}

          {photo.takenAt && (
            <span>{formatDateTime(photo.takenAt)}</span>
          )}

          {photo.lens && (
            <span>{photo.lens}</span>
          )}

          {photo.focalLength && <span className="font-mono">{photo.focalLength}</span>}
          {photo.aperture && <span className="font-mono">{photo.aperture}</span>}
          {photo.shutterSpeed && <span className="font-mono">{photo.shutterSpeed}</span>}
          {photo.iso && <span className="font-mono">ISO{photo.iso}</span>}

          {photo.location && (
            <span>{photo.location}</span>
          )}

          {photo.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {photo.category}
            </span>
          )}

          {/* 图片尺寸 */}
          {(photo.width && photo.height) && (
            <span className="font-mono">{photo.width} × {photo.height}</span>
          )}
        </div>
      </div>
    </div>
  )
}
