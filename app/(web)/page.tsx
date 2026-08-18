import React from 'react'
import List from '@/components/custom/List'
import { type Metadata } from 'next/types'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.signature}`
}

const IndexPage: React.FC<{
  searchParams?: Record<string, string | string[] | undefined>
}> = ({ searchParams }) => {
  return <List searchParams={searchParams}/>
}

export default IndexPage
