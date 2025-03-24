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

const initScript = `
                try {
                  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#161b22')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}

                let loadedLive2d = false

                function loadLive2d () {
                   if (screen && screen.width >= 768 && !loadedLive2d) {
                    const script = document.createElement('script')
                    script.src = '/lib/l2d.js'
                    script.defer = true
                    document.head.appendChild(script)
                    loadedLive2d = true
                  }
                }

                loadLive2d()

                window.addEventListener('resize', loadLive2d)
              `

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
        dangerouslySetInnerHTML={{
          __html: initScript
        }}
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
