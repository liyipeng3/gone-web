import '@/styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'

import NextApp, { type AppContext, type AppProps } from 'next/app'
import React from 'react'
import { Layout } from '@/components/layout'
import prisma from '@/utils/prisma'

interface CustomAppProps {
  visitTimes: number
}

class App extends NextApp {
  static async getInitialProps (content: AppContext) {
    const initialProps = await NextApp.getInitialProps(content)
    const visitTimesData = await prisma.options?.findFirst({
      where: {
        name: 'visitTimes'
      },
      select: {
        value: true
      }
    })
    return {
      ...initialProps,
      visitTimes: visitTimesData?.value ?? 0
    }
  }

  componentDidMount () {
    const v = sessionStorage.getItem('_v')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/v', {
        method: 'GET'
      }).then(_ => undefined)
    }
    console.log('%c lyp123 %c https://lyp123.com ', 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }

  render () {
    const {
      Component,
      pageProps,
      visitTimes
    } = this.props as AppProps & CustomAppProps
    return (
      <Layout visitTimes={visitTimes}>
        <Component {...pageProps}/>
      </Layout>
    )
  }
}

export default App
