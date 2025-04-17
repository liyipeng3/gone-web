import React, { type ReactNode } from 'react'
import cn from 'classnames'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import { siteConfig } from '@/config/site'
import FloatingButtons from '@/components/common/floating-buttons'

interface LayoutProps {
  children: ReactNode
  hotList?: any[]
}

export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return (
    <div className={cn('document w-full dark:text-white dark:bg-dark antialiased')}>
      <Header logo={siteConfig.name}/>
      {children}
      <Footer/>
      <FloatingButtons />
    </div>
  )
}
