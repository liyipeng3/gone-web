import React from 'react'
import '@/styles/global.scss'
import 'highlight.js/scss/github-dark-dimmed.scss'
import Script from 'next/script'
import { cn } from '@/lib/utils'
import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.signature}`,
    template: `%s - ${siteConfig.name}`
  }
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
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="mobile-web-app-capable" content="yes"/>
      <meta name="description" content={siteConfig.description}/>
      <meta name="theme-color" content="#ffffff"/>
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
      {children}
    <Toaster/>
    </body>
    </html>
  )
}
