import React from 'react'
import { getPageTagPostList } from '@/services/post'
import List from '@/components/custom/List'

const Tag: React.FC<{
  searchParams: Record<string, string | string[] | undefined>
  params: Record<string, string | string[] | undefined>
}> = async ({
  searchParams,
  params
}) => {
  const pageNum: number = searchParams?.p as unknown as boolean ? parseInt(searchParams?.p as string) : 1
  const tag: string = decodeURIComponent(params?.key as string ?? '')
  const pageProps = await getPageTagPostList({
    pageNum,
    tag
  })
  return <List {...pageProps} />
}

export default Tag
