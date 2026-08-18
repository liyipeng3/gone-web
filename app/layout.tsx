import React from 'react'
import '@/styles/global.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'
import Script from 'next/script'
import { cn } from '@/lib/utils'
import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/toaster'
import { siteConfig } from '@/config/site'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.signature}`,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    title: `${siteConfig.name} - ${siteConfig.signature}`,
    description: siteConfig.description,
    siteName: siteConfig.name
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // light/dark 双色声明，避免深色首屏地址栏出现白条；dark 值对齐 header 背景色
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#161b22' }
  ]
}

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const fontHeading = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading'
})

export default function RootLayout ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
    <head>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="mobile-web-app-capable" content="yes"/>
      <meta name="description" content={siteConfig.description}/>
      <Script
        id="init-script"
        src='/lib/init.js'
        strategy="beforeInteractive"
      />
    </head>
    <body className={cn(
      'min-h-screen bg-background font-sans antialiased',
      fontSans.variable,
      fontHeading.variable
    )}>
      <ThemeProvider attribute="class">
        {children}
      </ThemeProvider>
    <Toaster/>
    </body>
    </html>
  )
}
