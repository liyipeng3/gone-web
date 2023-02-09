import React, { type ReactNode } from 'react'
import cn from 'classnames'
import { Header } from '@components/common/header'
import { Footer } from '@components/common/footer'

interface LayoutProps {
  children: ReactNode
  visitTimes?: number
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  visitTimes
}) => {
  const menus = [{
    name: '首页',
    path: '/'
  }, {
    name: '分类',
    path: '/category',
    children: [{
      name: '生活',
      path: '/category/life'
    }, {
      name: '技术',
      path: '/category/tech'
    }, {
      name: '分享',
      path: '/category/share'
    }]
  }, {
    name: '归档',
    path: '/archive'
  },
  {
    name: '留言',
    path: '/message'
  },
  {
    name: '友链',
    path: '/link'
  }, {
    name: '关于',
    path: '/about'
  }]

  return (
    <div className={cn('document w-screen dark:bg-dark dark:text-white')}>
      <Header logo="lyp123" menus={menus}/>
      {children}
      <Footer visitTimes={visitTimes}/>
    </div>
  )
}
