import React from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { getGalleryList } from '@/models/gallery'
import GalleryManagementGrid from '@/components/dashboard/gallery-management-grid'
import GalleryUploadButton from '@/components/dashboard/gallery-upload-button'
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '相册管理',
  description: '管理和上传相册照片'
}

interface GalleryManagementPageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
  }
}

export default async function GalleryManagementPage ({ searchParams }: GalleryManagementPageProps) {
  const page = parseInt(searchParams.page ?? '1')
  const pageSize = 12
  const offset = (page - 1) * pageSize

  const { items, total } = await getGalleryList({
    category: searchParams.category,
    tag: searchParams.tag,
    limit: pageSize,
    offset,
    orderBy: 'createdAt',
    orderDirection: 'desc',
    isPublic: undefined
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <DashboardShell>
      <DashboardHeader heading="相册管理" text="管理和上传相册照片">
        <GalleryUploadButton />
      </DashboardHeader>

      <div>
        {items.length > 0
          ? (
          <GalleryManagementGrid
            items={items}
            total={total}
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
          />
            )
          : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="image" />
            <EmptyPlaceholder.Title>暂无照片</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              还没有上传任何照片。开始上传您的第一张照片。
            </EmptyPlaceholder.Description>
            <GalleryUploadButton variant="outline" />
          </EmptyPlaceholder>
            )}
      </div>
    </DashboardShell>
  )
}
