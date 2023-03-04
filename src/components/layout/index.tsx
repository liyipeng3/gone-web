import React, { type ReactNode } from 'react'
import cn from 'classnames'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'

interface LayoutProps {
  children: ReactNode
  hotList?: any[]
}

export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return (
    <div className={cn('document w-full dark:text-white dark:bg-dark antialiased')}>
      <Header logo="lyp123"/>
      {children}
      <Footer/>
    </div>
  )
}
