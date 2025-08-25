import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getGalleryById, getAdjacentPhotos } from '@/models/gallery'
import KeyboardNavigation from '@/components/common/photo-navigation/keyboard-navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { getCameraBrand, formatCameraModel } from '@/lib/camera-brands'
import dayjs from 'dayjs'
import ProgressiveImage from '@/components/common/image/ProgressiveImage'
import { defaultIcons } from '@/components/common/prose/lightbox'
import { getSimpleLocation } from '@/lib/regions'

interface PhotoDetailPageProps {
  params: {
    gid: string
  }
  searchParams: {
    category?: string
  }
}

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

      <div className="space-y-8 mt-8 h-max">
        <div className="w-full h-max drop-shadow-lg">
          <div className="relative h-max md:h-[85vh] flex flex-col justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <ProgressiveImage
              thumbnailSrc={photo.thumbnailPath ?? photo.imagePath}
              src={photo.imagePath}
              alt={photo.title ?? '照片'}
              wrapperClassName="object-contain w-full h-full cursor-pointer"
              className='object-contain w-full h-full'
              preview={
                {
                  icons: defaultIcons
                }
              }
            />
          </div>
          <div className="md:hidden flex justify-center w-full select-none">
            <div className="flex flex-col gap-3 px-4 py-4 text-sm text-gray-600 dark:text-gray-800 shadow-lg bg-white dark:bg-gray-300 dark:shadow-gray-500 dark:shadow-md w-full">
              {photo.camera && (() => {
                const brand = getCameraBrand(photo.camera)
                return (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{formatCameraModel(photo.camera)}</span>
                    {brand && (
                      <div className="w-auto h-4 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={brand.logo} alt={brand.name} className='w-auto h-full' />
                      </div>
                    )}
                  </div>
                )
              })()}
              <div className="flex flex-wrap gap-2 font-bold">
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
              {photo.lens && (
                <div className="text-gray-600 text-sm flex">{photo.lens}</div>
              )}
              <div className='flex flex-row justify-between'>
              <span className='text-gray-600 text-sm flex'>{photo?.takenAt ? dayjs(photo?.takenAt).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                <div className='flex'>{getSimpleLocation(photo?.location ?? '')}</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-center w-full select-none">
            <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-6 text-sm text-gray-600 dark:text-gray-800 h-24 bg-white dark:bg-gray-300 dark:shadow-gray-500 dark:shadow-md"
              style={{ width: `min(100%, min(85vh * ${photo.width}/${photo.height}, 100vw))` }}>
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
                  <span className='text-gray-600 text-sm'>{dayjs(photo.takenAt).format('YYYY.MM.DD HH:mm:ss')}</span>
                )}
              </div>
              {photo.location && <span>{getSimpleLocation(photo.location)}</span>}
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
                                  className='w-auto h-full'
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

        </div>
        {(photo.description ?? tags.length > 0) && (
            <>
              <div className="md:hidden w-full mt-6">
                <div className="flex flex-col gap-3 px-4">
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
              <div className="hidden md:flex justify-center w-full mt-8">
                <div
                  className="flex flex-wrap items-center justify-center gap-4"
                  style={{ width: `min(100%, min(85vh * ${photo.width}/${photo.height}, 100vw))` }}
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
            </>
        )}
      </div>

      {adjacentPhotos.previous && (
        <Link
          href={`/gallery/photo/${adjacentPhotos.previous.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`}
          className="group fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 transform z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full transition-all duration-300 opacity-60 hover:opacity-100 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:scale-110 active:scale-95 flex items-center justify-center"
          title="上一张 (←)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      )}

      {adjacentPhotos.next && (
        <Link
          href={`/gallery/photo/${adjacentPhotos.next.gid}${searchParams.category ? `?category=${searchParams.category}` : ''
            }`}
          className="group fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 transform z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full transition-all duration-300 opacity-60 hover:opacity-100 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:scale-110 active:scale-95 flex items-center justify-center"
          title="下一张 (→)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

    </div>
  )
}
