import React from 'react'
import type { Metadata } from 'next'
import Breadcrumb from '@/components/common/breadcrumb'
import { getGalleryList, getGalleryCategories } from '@/models/gallery'
import GalleryGrid from '@/components/common/gallery'
import GalleryFilter from '@/components/common/gallery/filter'

export const metadata: Metadata = {
  title: '相册 - 记录美好时光',
  description: '分享生活中的美好瞬间，记录旅行与日常的精彩照片。'
}

interface GalleryPageProps {
  searchParams: {
    category?: string
    tag?: string
    page?: string
  }
}

// 使用 SSR 渲染相册页面
export default async function GalleryPage ({ searchParams }: GalleryPageProps) {
  const page = parseInt(searchParams.page ?? '1')
  const pageSize = 24
  const offset = (page - 1) * pageSize

  // 并行获取数据
  const [galleryData, categories] = await Promise.all([
    getGalleryList({
      category: searchParams.category,
      tag: searchParams.tag,
      limit: pageSize,
      offset,
      orderBy: 'takenAt',
      orderDirection: 'desc',
      isPublic: true
    }),
    getGalleryCategories()
  ])

  const { items, total } = galleryData
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="md:max-w-6xl max-w-full text-left flex-1 w-screen lg:w-[72rem] md:w-[48rem] mx-auto px-4 pb-10 pt-3">
      <Breadcrumb
        items={[
          { name: '相册', href: '/gallery' }
        ]}
      />

      <div className="md:mb-6 mt-4">
        <h1 className="dark:text-white text-2xl font-bold mb-2">相册</h1>
        <p className="text-gray-600 dark:text-gray-400">
          分享生活中的美好瞬间，共 {total} 张照片
        </p>
      </div>

      {/* 过滤器 */}
      <GalleryFilter
        categories={categories}
        currentCategory={searchParams.category}
        currentTag={searchParams.tag}
      />

      {/* 相册网格 */}
      <GalleryGrid
        items={items}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        basePath="/gallery"
      />

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-2">📷</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            暂无照片
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchParams.category ?? searchParams.tag
              ? '当前筛选条件下没有找到照片'
              : '还没有上传任何照片'}
          </p>
        </div>
      )}
    </div>
  )
}
