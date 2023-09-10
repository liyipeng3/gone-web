'use client'
import React, { useEffect } from 'react'
import '@/styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'
import { Layout } from '@/components/layout'

export default function RootLayout ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const v = sessionStorage.getItem('_v')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/_v', {
        method: 'GET'
      }).then(_ => {
      })
    }
    console.log('%c lyp123 %c https://lyp123.com ', 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }, [])
  return (
    <Layout>
      {children}
    </Layout>
  )
}
