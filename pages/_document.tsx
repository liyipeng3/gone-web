// In `pages/_document.js`
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import React from 'react'

export default function Document () {
  return (
    <Html>
      <Head/>
      <body>
      <Main/>
      <NextScript/>
      <Script src="/lib/l2d.js" strategy="beforeInteractive"/>
      </body>
    </Html>
  )
}
