import React from 'react'
import List from '@/components/custom/List'
import { type Metadata } from 'next/types'

export function generateMetadata (
  { params }: { params: { num: string } }
): Metadata {
  const num = params?.num ?? '1'
  return {
    title: `第 ${num} 页`,
    alternates: {
      canonical: `/page/${num}`
    }
  }
}

const Page: React.FC<{
  searchParams?: Record<string, string | string[] | undefined>
  params?: Record<string, string>
}> = ({
  searchParams,
  params
}) => {
  return <List searchParams={searchParams} params={params}/>
}

export default Page
