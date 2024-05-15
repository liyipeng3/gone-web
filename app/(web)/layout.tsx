import React from 'react'
import '@/styles/global.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'
import { Layout } from '@/components/layout'
import AllView from '@/components/custom/View/all'

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Layout>
      {children}
      <AllView/>
    </Layout>
  )
}
