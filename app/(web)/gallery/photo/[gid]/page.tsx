import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getGalleryById, getAdjacentPhotos } from '@/models/gallery'
import KeyboardNavigation from '@/components/common/photo-navigation/keyboard-navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
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
export async function generateMetadata ({
  params
}: PhotoDetailPageProps): Promise<Metadata> {
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

function formatDateTime (timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${ss}`
}

export default async function PhotoDetailPage ({
  params,
  searchParams
}: PhotoDetailPageProps) {
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

  if (!photo.isPublic) {
    redirect('/gallery')
  }

  const tags = photo.tags ? JSON.parse(photo.tags) : []

  return (
    <div className="w-full mx-auto px-4 pb-10 pt-3 relative">
      <KeyboardNavigation
        previousUrl={
          adjacentPhotos.previous
            ? `/gallery/photo/${adjacentPhotos.previous.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`
            : undefined
        }
        nextUrl={
          adjacentPhotos.next
            ? `/gallery/photo/${adjacentPhotos.next.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`
            : undefined
        }
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
        <div className="w-full">
          <div className="relative h-[85vh]">
            <Image
              src={photo.thumbnailPath ?? photo.imagePath}
              alt={photo.title ?? '照片'}
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* 信息区域容器 - 通过 flex 和 justify-center 来居中 */}
          <div className="flex justify-center w-full ">
            <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-6 text-sm text-gray-600 dark:text-gray-800 h-24 shadow-lg bg-white dark:bg-gray-300 dark:shadow-gray-500 dark:shadow-md"
              style={{ width: `min(100%, min(85vh * ${photo.width}/${photo.height}, 85vw))` }}>
              <div className="flex flex-col items-start justify-between h-full">
                {photo.camera &&
                  (() => {
                    const brand = getCameraBrand(photo.camera)
                    return (
                      <div className="flex items-center gap-2">
                        {brand
                          ? (
                            <div className='flex items-center gap-2 justify-between'>

                              <span className=" font-bold">
                                {formatCameraModel(photo.camera)}
                              </span>
                            </div>
                            )
                          : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span className="font-medium">
                                {photo.camera}
                              </span>
                            </>
                            )}
                      </div>
                    )
                  })()}

                {photo.takenAt && (
                  <span className='text-gray-600 text-sm'>{formatDateTime(photo.takenAt)}</span>
                )}
              </div>
              {photo.location && <span>{photo.location.replaceAll(/中国 · |省|市|区|壮族自治区|回族自治区|蒙古族自治区|苗族自治区|彝族自治区|藏族自治区|维吾尔自治区|壮族自治区|回族自治区|蒙古族自治区|苗族自治区|彝族自治区/g, '')}</span>}
              <div className='flex flex-row gap-4 items-center h-full'>
                {photo.camera &&
                  (() => {
                    const brand = getCameraBrand(photo.camera)
                    return (
                      <div className="flex items-center gap-2">
                        {brand
                          ? (
                            <div className='flex items-center gap-2 justify-between'>
                              <div className="w-auto h-4 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className='w-full h-full'
                                />
                              </div>

                            </div>
                            )
                          : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span className="font-medium">
                                {photo.camera}
                              </span>
                            </>
                            )}
                      </div>
                    )
                  })()}
                <div className='w-[1px] h-8 bg-gray-200 dark:bg-gray-400'></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex flex-row gap-2 font-bold" >
                    {photo.focalLength && (
                      <span className="font-mono">{photo.focalLength}</span>
                    )}
                    {photo.aperture && (
                      <span className="font-mono">{photo.aperture}</span>
                    )}
                    {photo.shutterSpeed && (
                      <span className="font-mono">{photo.shutterSpeed}</span>
                    )}
                    {photo.iso && (
                      <span className="font-mono">ISO{photo.iso}</span>
                    )}
                  </div>
                  <div className="flex flex-row text-gray-600 text-sm">
                    {photo.lens && <span>{photo.lens}</span>}
                  </div>

                </div>
              </div>
            </div>
          </div>
          {/* 描述和标签区域 - 一行展示 */}
          {(photo.description ?? tags.length > 0) && (
            <div className="flex justify-center w-full mt-8">
              <div
                className="flex flex-wrap items-center justify-center gap-4"
                style={{ width: `min(100%, min(85vh * ${photo.width}/${photo.height}, 85vw))` }}
              >
                {photo.description && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {photo.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {adjacentPhotos.previous && (
        <Link
          href={`/gallery/photo/${adjacentPhotos.previous.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`}
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 transform z-20 bg-black/30 hover:bg-black/60 text-white px-2 py-8 sm:px-3 sm:py-12 rounded transition-all duration-200 opacity-50 hover:opacity-80 shadow-md backdrop-blur-sm dark:bg-gray-800"
          title="上一张 (←)"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      )}

      {adjacentPhotos.next && (
        <Link
          href={`/gallery/photo/${adjacentPhotos.next.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`}
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 transform z-20 bg-black/30 hover:bg-black/60 text-white px-2 py-8 sm:px-3 sm:py-12 rounded transition-all duration-200 opacity-50 hover:opacity-80 shadow-md backdrop-blur-sm dark:bg-gray-800"
          title="下一张 (→)"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      )}
    </div>
  )
}
