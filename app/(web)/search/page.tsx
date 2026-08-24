import List from '@/components/custom/List'
import React from 'react'
import { type Metadata } from 'next/types'

// 搜索结果页对 SEO 无收录价值，noindex 但允许跟随其中链接
export const metadata: Metadata = {
  title: '搜索',
  robots: {
    index: false,
    follow: true
  }
}

const Search: React.FC<{
  searchParams?: Record<string, string | string[] | undefined>
}> = ({ searchParams }) => {
  return <List searchParams={searchParams}/>
}

export default Search
