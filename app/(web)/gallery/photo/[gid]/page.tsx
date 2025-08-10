import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getGalleryById, getAdjacentPhotos } from '@/models/gallery'
import KeyboardNavigation from '@/components/common/photo-navigation/keyboard-navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react'

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

// 格式化文件大小
function formatFileSize (bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

        {/* 信息展示区域 */}
        <div className=" rounded-lg overflow-hidden">

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：基本信息和位置 */}
              <div className="space-y-6">
                {/* 基本信息表格 */}
                <div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <dl className="space-y-3">
                      {photo.takenAt && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">拍摄时间</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right">
                            {formatDateTime(photo.takenAt)}
                          </dd>
                        </div>
                      )}
                      {photo.createdAt && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">上传时间</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right">
                            {formatDateTime(photo.createdAt)}
                          </dd>
                        </div>
                      )}
                      {photo.category && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">分类</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {photo.category}
                            </span>
                          </dd>
                        </div>
                      )}
                      {(photo.width && photo.height) && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">图片尺寸</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right">
                            {photo.width} × {photo.height}px
                          </dd>
                        </div>
                      )}
                      {photo.fileSize && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">文件大小</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right">
                            {formatFileSize(photo.fileSize)}
                          </dd>
                        </div>
                      )}
                      {photo.mimeType && (
                        <div className="flex justify-between items-start">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">文件类型</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                            {photo.mimeType}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* 位置信息 */}
                {(photo.location ?? (photo.latitude && photo.longitude)) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      位置信息
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <dl className="space-y-3">
                        {photo.location && (
                          <div className="flex justify-between items-start">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">拍摄地点</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">
                              {photo.location}
                            </dd>
                          </div>
                        )}
                        {photo.latitude && photo.longitude && (
                          <div className="flex justify-between items-start">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GPS坐标</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                              {Number(photo.latitude).toFixed(6)}, {Number(photo.longitude).toFixed(6)}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：拍摄设备信息 */}
              {(photo.camera ?? photo.lens ?? photo.aperture ?? photo.shutterSpeed ?? photo.iso ?? photo.focalLength) && (
                <div className="space-y-6">
                  <div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <dl className="space-y-3">
                        {photo.camera && (
                          <div className="flex justify-between items-start">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">相机</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">
                              {photo.camera}
                            </dd>
                          </div>
                        )}
                        {photo.lens && (
                          <div className="flex justify-between items-start">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">镜头</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">
                              {photo.lens}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {(photo.aperture ?? photo.shutterSpeed ?? photo.iso ?? photo.focalLength) && (
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        {photo.aperture && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">光圈</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{photo.aperture}</div>
                          </div>
                        )}
                        {photo.shutterSpeed && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">快门</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{photo.shutterSpeed}</div>
                          </div>
                        )}
                        {photo.iso && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ISO</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{photo.iso}</div>
                          </div>
                        )}
                        {photo.focalLength && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">焦距</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{photo.focalLength}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
