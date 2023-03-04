import '@/styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'

import { type AppProps } from 'next/app'
import React, { useEffect } from 'react'
import { Layout } from '@/components/layout'
import Head from 'next/head'

interface CustomAppProps {
  visitTimes: number
}

const App: React.FC<AppProps & CustomAppProps> = ({
  Component,
  pageProps,
  visitTimes
}) => {
  useEffect(() => {
    const v = sessionStorage.getItem('_v')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/_v', {
        method: 'GET'
      }).then(_ => undefined)
    }
    console.log('%c lyp123 %c https://lyp123.com ', 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }, [])

  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"/>
        <title></title>
      </Head>
      <Component {...pageProps}/>
    </Layout>
  )
}

export default App
