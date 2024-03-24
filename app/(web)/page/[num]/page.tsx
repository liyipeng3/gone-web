import React from 'react'
import List from '@/components/custom/List'
import { type Metadata } from 'next/types'

export const metadata: Metadata = {
  title: 'lyp123 - 做自己'
}
const Page: React.FC<{
  searchParams?: Record<string, string | string[] | undefined>
  params?: Record<string, string>
}> = ({ searchParams, params }) => {
  return <List searchParams={searchParams} params={params} />
}

export default Page
