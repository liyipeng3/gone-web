import '@styles/globals.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'

import type { AppProps } from 'next/app'
import React from 'react'
import { Layout } from '@components/layout'
import { Provider } from 'react-redux'
import { store } from '@stores'

const App: React.FC<AppProps> = ({
  Component,
  pageProps
}) => {
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps}/>
      </Layout>
    </Provider>
  )
}

export default App
