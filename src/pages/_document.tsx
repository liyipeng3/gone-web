// In `pages/_document.tsx`
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import React from 'react'

export default function Document () {
  return (
    <Html className="dark">
      <Head>
        <meta name="theme-color" content="#ffffff"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                try {
                  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#161b22')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}
              `
          }}
        />
      </Head>
      <body>
      <Main/>
      <Script src="/lib/l2d.js" strategy="beforeInteractive"/>
      <NextScript/>
      </body>
    </Html>
  )
}
