// In `pages/_document.js`
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import React from 'react'

export default function Document () {
  return (
    <Html>
      <Head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#161b22" media="(prefers-color-scheme: dark)"/>
      </Head>
      <body>
      <Main/>
      <NextScript/>
      <Script src="/lib/l2d.js" strategy="beforeInteractive"/>
      </body>
    </Html>
  )
}
