import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Breadcrumb from '@/components/common/breadcrumb'
import { getGalleryById } from '@/models/gallery'
import Image from 'next/image'
import { Eye, Calendar, Camera, Clock, Ruler, MapPin, Tag, User } from 'lucide-react'

interface PhotoDetailPageProps {
  params: {
    gid: string
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

export default async function PhotoDetailPage ({ params }: PhotoDetailPageProps) {
  const gid = parseInt(params.gid)

  if (isNaN(gid)) {
    notFound()
  }

  const photo = await getGalleryById(gid)

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
    <div className="md:max-w-6xl max-w-full text-left flex-1 w-screen lg:w-[72rem] md:w-[48rem] mx-auto px-4 pb-10 pt-3">
      <Breadcrumb
        items={[
          { name: '相册', href: '/gallery' },
          ...(photo.category ? [{ name: photo.category, href: `/gallery/${photo.category}` }] : []),
          { name: photo.title ?? '照片详情', href: `/gallery/photo/${photo.gid}` }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* 图片展示区域 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
              <Image
                src={photo.thumbnailPath ?? photo.imagePath}
                alt={photo.title ?? '照片'}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            {/* 图片标题和描述 */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {photo.title ?? '未命名照片'}
              </h1>
              {photo.description ?? (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {photo.description}
                </p>
              )}

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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

        {/* 信息侧边栏 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              基本信息
            </h2>
            <div className="space-y-3 text-sm">
              {photo.takenAt && (
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">拍摄时间</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(photo.takenAt)}
                    </div>
                  </div>
                </div>
              )}

              {photo.createdAt && (
                <div className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">上传时间</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(photo.createdAt)}
                    </div>
                  </div>
                </div>
              )}

              {photo.category && (
                <div className="flex items-start">
                  <Tag className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">分类</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {photo.category}
                    </div>
                  </div>
                </div>
              )}

              {photo.location && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">拍摄地点</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {photo.location}
                    </div>
                    {photo.latitude && photo.longitude && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        坐标: {Number(photo.latitude).toFixed(6)}, {Number(photo.longitude).toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 如果只有GPS坐标但没有地址的情况 */}
              {!photo.location && photo.latitude && photo.longitude && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">GPS坐标</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {Number(photo.latitude).toFixed(6)}, {Number(photo.longitude).toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {(photo.width && photo.height) && (
                <div className="flex items-start">
                  <Ruler className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">图片尺寸</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {photo.width} × {photo.height}px
                    </div>
                  </div>
                </div>
              )}

              {photo.fileSize && (
                <div className="flex items-start">
                  <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">文件大小</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {formatFileSize(photo.fileSize)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 拍摄信息 (EXIF) */}
          {(photo.camera ?? photo.lens ?? photo.aperture ?? photo.shutterSpeed ?? photo.iso ?? photo.focalLength) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                拍摄信息
              </h2>
              <div className="space-y-3 text-sm">
                {photo.camera && (
                  <div className="flex items-start">
                    <Camera className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">相机</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.camera}
                      </div>
                    </div>
                  </div>
                )}

                {photo.lens && (
                  <div className="flex items-start">
                    <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">🔍</div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">镜头</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.lens}
                      </div>
                    </div>
                  </div>
                )}

                {photo.focalLength && (
                  <div className="flex items-start">
                    <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">📏</div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">焦距</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.focalLength}
                      </div>
                    </div>
                  </div>
                )}

                {photo.aperture && (
                  <div className="flex items-start">
                    <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">⚫</div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">光圈</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.aperture}
                      </div>
                    </div>
                  </div>
                )}

                {photo.shutterSpeed && (
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">快门速度</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.shutterSpeed}
                      </div>
                    </div>
                  </div>
                )}

                {photo.iso && (
                  <div className="flex items-start">
                    <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">📊</div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">ISO</div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {photo.iso}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 技术信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              技术信息
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">🆔</div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">照片 ID</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    #{photo.gid}
                  </div>
                </div>
              </div>

              {photo.mimeType && (
                <div className="flex items-start">
                  <div className="w-4 h-4 mr-2 mt-0.5 text-gray-500 text-center">📄</div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">文件类型</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {photo.mimeType}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
