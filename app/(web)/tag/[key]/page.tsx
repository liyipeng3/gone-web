import React from 'react'
import { getPageTagPostList, getTagName } from '@/services/post'
import List from '@/components/custom/List'
import { type Metadata } from 'next/types'

export async function generateMetadata (
  { params }: { params: { key: string } }
): Promise<Metadata> {
  const tag = decodeURIComponent(params?.key ?? '')
  const name = await getTagName(tag)
  const displayName = name ?? tag
  return {
    title: `标签：${displayName}`,
    description: `标签 ${displayName} 下的文章列表`,
    alternates: {
      canonical: `/tag/${params.key}`
    }
  }
}

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
