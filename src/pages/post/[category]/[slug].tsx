import React from 'react'
import marked from '@/utils/marked'
import Prose from '@/components/common/prose'
import Head from 'next/head'
import dayjs from 'dayjs'
import { type HotList } from '@/types'
import Main from '@/components/layout/main'
import { type GetServerSideProps } from 'next'
import { getHotList, getPost, incrementViews } from '@/models/content'
import Breadcrumb from '@/components/common/breadcrumb'

interface ContentProps {
  title: string
  content: string
  created: number
  name: string
  hotList: HotList
  viewsNum: number
  category?: string
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug: string = context.params?.slug as string ?? ''
  const post = await getPost(slug)
  if (post === null) {
    return {
      notFound: true
    }
  }
  const content = marked.parse(post.text ?? '')
  const hotList = await getHotList()
  const cookies = context.req.cookies
  const views = new Set((cookies.postView != null) ? cookies.postView.split(',') : [])
  const cid = String(post.cid)
  if (!views.has(cid)) {
    await incrementViews(post.cid)
    views.add(String(post.cid))
    context.res.setHeader('set-cookie', `postView=${Array.from(views).join(',')}`)
  }

  return {
    props: {
      title: post.title,
      content,
      created: post.created,
      name: post.relationships[0].metas.name,
      category: post.relationships[0].metas.slug,
      viewsNum: post.viewsNum,
      hotList
    }
  }
}

const Content: React.FC<ContentProps> = ({
  title,
  content,
  created,
  name,
  category,
  viewsNum,
  hotList
}) => {
  return (
    <Main hotList={hotList}>
      <Head>
        <title>{`${title} - lyp123`}</title>
      </Head>
      <article className="md:max-w-3xl max-w-full text-left flex-1 prose">
        <Breadcrumb items={[{
          name,
          href: `/category/${category as string}`
        }, { name: '正文' }]}/>
        <h2 className="md:mb-2 md:mt-4 dark:text-white">{title}</h2>
        <div className="text-xs mb-5 -mt-3 md:mt-3 my-3 text-gray-500 space-x-1 dark:text-gray-400">
          <span>{dayjs(new Date(created * 1000)).format('YYYY-MM-DD')}</span>
          <span>•</span>
          <span>{name}</span>
          <span>•</span>
          <span>{viewsNum}人阅读</span>
        </div>
        <Prose content={content}/>
      </article>
    </Main>
  )
}

export default Content
