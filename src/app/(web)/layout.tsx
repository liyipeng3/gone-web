import React from 'react'
import '@/styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'
import { Layout } from '@/components/layout'
import AllView from '@/components/custom/View/all'

export default function RootLayout ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
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
