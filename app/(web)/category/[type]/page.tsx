import React from 'react'
import { getPageCategoryPostList } from '@/services/post'
import List from '@/components/custom/List'

const Category: React.FC<{
  searchParams: Record<string, string | string[] | undefined>
  params: Record<string, string | string[] | undefined>
}> = async ({
  searchParams,
  params
}) => {
  const pageNum: number = searchParams?.p as unknown as boolean ? parseInt(searchParams?.p as string) : 1
  const category: string = params?.type as string ?? ''
  const pageProps = await getPageCategoryPostList({
    pageNum,
    category
  })
  return <List {...pageProps} />
}

export default Category
