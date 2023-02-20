import '@/styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'

import NextApp, { type AppContext, type AppProps } from 'next/app'
import React, { useEffect } from 'react'
import { Layout } from '@/components/layout'
// import { Provider } from 'react-redux'
// import { store } from '@/stores'
import prisma from '@/utils/prisma'
import { type HotList } from '@/types'

interface CustomAppProps {
  visitTimes: number
  hotList: HotList
}

const App: React.FC<AppProps & CustomAppProps> = ({
  Component,
  pageProps,
  visitTimes,
  hotList
}) => {
  useEffect(() => {
    const v = sessionStorage.getItem('_v')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/v', {
        method: 'GET'
      }).then(_ => undefined)
    }
    console.log('%c lyp123 %c https://lyp123.com ', 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }, [])

  return (
    <Layout visitTimes={visitTimes}>
      <Component {...pageProps}/>
    </Layout>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
App.getInitialProps = async (context: AppContext) => {
  const ctx = await NextApp.getInitialProps(context)
  const visitTimesData = await prisma.options?.findFirst({
    where: {
      name: 'visitTimes'
    },
    select: {
      value: true
    }
  })

  return {
    ...ctx,
    visitTimes: visitTimesData?.value ?? 0
  }
}

export default App
