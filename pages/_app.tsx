import '@styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'

import NextApp, { type AppContext, type AppProps } from 'next/app'
import React from 'react'
import { Layout } from '@components/layout'
import { Provider } from 'react-redux'
import { store } from '@stores'
import prisma from '@utils/prisma'

interface CustomAppProps {
  visitTimes: number
}

const App: React.FC<AppProps & CustomAppProps> = ({
  Component,
  pageProps,
  visitTimes
}) => {
  return (
    <Provider store={store}>
      <Layout visitTimes={visitTimes}>
        <Component {...pageProps}/>
      </Layout>
    </Provider>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
App.getInitialProps = async (context: AppContext) => {
  const ctx = await NextApp.getInitialProps(context)
  const data = await prisma.options.findFirst({
    where: {
      name: 'visitTimes'
    },
    select: {
      value: true
    }
  })
  return {
    ...ctx,
    visitTimes: data?.value ?? 0
  }
}

export default App
