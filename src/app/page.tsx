import React from 'react'
import Page, { type PageProps } from '@/app/(blog)/page/[num]/page'
import { Layout } from '@/components/layout'

// import CompState from "@/components/test/state";

const IndexPage: React.FC<PageProps> = ({
  list,
  total,
  hotList
}) => {
  return (
    <Layout>
      <Page list={list} total={total} hotList={hotList}/>
    </Layout>
  )
}

export default IndexPage
