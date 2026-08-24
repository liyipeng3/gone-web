import React from 'react'
import { getCategoryName, getPageCategoryPostList } from '@/services/post'
import List from '@/components/custom/List'
import { type Metadata } from 'next/types'

export async function generateMetadata (
  { params }: { params: { key: string } }
): Promise<Metadata> {
  const category = decodeURIComponent(params?.key ?? '')
  const name = await getCategoryName(category)
  const displayName = name ?? category
  return {
    title: `分类：${displayName}`,
    description: `分类 ${displayName} 下的文章列表`,
    alternates: {
      canonical: `/category/${params.key}`
    }
  }
}

const Category: React.FC<{
  searchParams: Record<string, string | string[] | undefined>
  params: Record<string, string | string[] | undefined>
}> = async ({
  searchParams,
  params
}) => {
  const pageNum: number = searchParams?.p as unknown as boolean ? parseInt(searchParams?.p as string) : 1
  const category: string = params?.key as string ?? ''
  const pageProps = await getPageCategoryPostList({
    pageNum,
    category
  })
  return <List {...pageProps} />
}

export default Category
