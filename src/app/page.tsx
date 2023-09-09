import React from 'react'
import Page from '@/app/(blog)/page/[num]/page'
import { Layout } from '@/components/layout'

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <Page />
    </Layout>
  )
}

export default IndexPage
