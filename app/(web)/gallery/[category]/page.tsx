import React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Breadcrumb from '@/components/common/breadcrumb'
import { getGalleryList, getGalleryCategories } from '@/models/gallery'
import GalleryGrid from '@/components/common/gallery'
import GalleryFilter from '@/components/common/gallery/filter'

interface CategoryGalleryPageProps {
  params: {
    category: string
  }
  searchParams: {
    tag?: string
    page?: string
  }
}

export async function generateMetadata ({ params }: CategoryGalleryPageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category)

  return {
    title: `${category} - 相册`,
    description: `查看 ${category} 分类下的所有照片`
  }
}

export default async function CategoryGalleryPage ({ params, searchParams }: CategoryGalleryPageProps) {
  const category = decodeURIComponent(params.category)
  const page = parseInt(searchParams.page ?? '1')
  const pageSize = 24
  const offset = (page - 1) * pageSize

  const categories = await getGalleryCategories()
  if (!categories.includes(category)) {
    redirect('/gallery')
  }

  const galleryData = await getGalleryList({
    category,
    tag: searchParams.tag,
    limit: pageSize,
    offset,
    orderBy: 'takenAt',
    orderDirection: 'desc',
    isPublic: true
  })

  const { items, total } = galleryData
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="md:max-w-6xl max-w-full text-left flex-1 w-screen lg:w-[72rem] md:w-[48rem] mx-auto px-4 pb-10 pt-3">
      <Breadcrumb
        items={[
          { name: '相册', href: '/gallery' },
          { name: category, href: `/gallery/${category}` }
        ]}
      />

      <div className="md:mb-6 mt-4">
        <h1 className="dark:text-white text-2xl font-bold mb-2">{category}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          分类下共 {total} 张照片
        </p>
      </div>

      <GalleryFilter
        categories={categories}
        currentCategory={category}
        currentTag={searchParams.tag}
      />

      <GalleryGrid
        items={items}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        basePath={`/gallery/${category}`}
      />

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-2">📷</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            暂无照片
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {category} 分类下{searchParams.tag ? '符合标签条件的' : ''}暂无照片
          </p>
        </div>
      )}
    </div>
  )
}
