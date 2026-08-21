import React from 'react'
import type { Metadata } from 'next'

import { getGalleryList } from '@/models/gallery'
import GalleryWaterfall from '@/components/common/gallery'

export const metadata: Metadata = {
  title: '相册 - 定格当下',
  description: '记录生活的美好瞬间'
}

interface GalleryPageProps {
  searchParams: {
    category?: string
    tag?: string
  }
}

export default async function GalleryPage ({ searchParams }: GalleryPageProps) {
  const pageSize = 24

  const { items, total } = await getGalleryList({
    category: searchParams.category,
    tag: searchParams.tag,
    limit: pageSize,
    offset: 0,
    orderBy: 'takenAt',
    orderDirection: 'desc',
    isPublic: true
  })

  return (
    <div className=" max-w-full text-left flex-1 w-screen mx-auto md:px-12 px-4 pb-10 pt-3">
      {/* <Breadcrumb
        items={[
          { name: '相册', href: '/gallery' }
        ]}
      /> */}
{/*
      <div className="md:mb-6 mt-4">
        <h1 className="dark:text-white text-2xl font-bold mb-2">相册</h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {total} 张照片
        </p>
      </div> */}

      {/* <GalleryFilter
        categories={categories}
        currentCategory={searchParams.category}
        currentTag={searchParams.tag}
      /> */}
      <div className='md:h-8'></div>

      <GalleryWaterfall
        key={`${searchParams.category ?? 'all'}-${searchParams.tag ?? ''}`}
        items={items}
        total={total}
        pageSize={pageSize}
        category={searchParams.category}
        tag={searchParams.tag}
      />

      {items.length === 0 && (
        <div className="text-center h-[calc(100vh-300px)] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-lg mb-2">📷</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            暂无照片
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchParams.category ?? searchParams.tag
              ? '当前筛选条件下没有找到照片'
              : '还没照片嘞'}
          </p>
        </div>
      )}
    </div>
  )
}
