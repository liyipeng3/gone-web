import React from 'react'
import Main from '@/components/layout/main'
import Head from 'next/head'
import Breadcrumb from '@/components/common/breadcrumb'
import Prose from '@/components/common/prose'
import { getPagePost } from '@/services/post'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于'
}

const Page: React.FC = async () => {
  const {
    title,
    content,
    hotList
  } = await getPagePost('about')

  return (
    <Main hotList={hotList}>
      <Head>
        <title>{`${title} - lyp123`}</title>
      </Head>
      <article className="md:max-w-3xl max-w-full text-left flex-1 prose w-screen lg:w-[48rem] md:w-[36rem]">
        <Breadcrumb items={[{
          name: '关于',
          href: '/about'
        }]}/>
        <h2 className="md:mb-2 mt-4 dark:text-white">{title}</h2>
        <Prose content={content}/>
      </article>
    </Main>
  )
}

export default Page
