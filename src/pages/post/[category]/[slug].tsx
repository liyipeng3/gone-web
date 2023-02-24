import React from 'react'
import marked from '@/utils/marked'
import Prose from '@/components/common/prose'
import prisma from '@/utils/prisma'
import Head from 'next/head'
import dayjs from 'dayjs'
import Link from 'next/link'
import { getHotList } from '@/services/contents'
import { type HotList } from '@/types'
import Main from '@/components/layout/main'
import { type GetServerSideProps } from 'next'

interface ContentProps {
  title: string
  content: string
  created: number
  name: string
  hotList: HotList
  viewsNum: number
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug: string = context.params?.slug as string ?? ''
  const post = await prisma.contents.findUnique({
    include: {
      relationships: {
        include: {
          metas: {
            select: {
              name: true
            }
          }
        },
        where: {
          metas: {
            type: 'category'
          }
        }
      }
    },
    where: {
      slug
    }
  })
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
    await prisma.contents.update({
      where: {
        cid: post.cid
      },
      data: {
        viewsNum: {
          increment: 1
        }
      }
    })
    views.add(String(post.cid))
    context.res.setHeader('set-cookie', `postView=${Array.from(views).join(',')}`)
  }
  console.log(JSON.stringify(post, null, 2))

  return {
    props: {
      title: post.title,
      content,
      created: post.created,
      name: post.relationships[0].metas.name,
      viewsNum: post.viewsNum,
      hotList
    } // will be passed to the page component as props
  }
}

const Content: React.FC<ContentProps> = ({
  title,
  content,
  created,
  name,
  viewsNum,
  hotList
}) => {
  return (
    <Main hotList={hotList}>
      <Head>
        <title>{`${title} - lyp123`}</title>
      </Head>
      <article className="md:max-w-3xl max-w-full text-left flex-1 prose">
        <div className="text-sm text-gray-500 dark:text-gray-400 -mb-8">
          <Link href="/" className="no-underline text-gray-500 font-normal dark:text-gray-400">首页</Link>
          <span> » </span>
          <Link href="/" className="no-underline text-gray-500 font-normal dark:text-gray-400">{name}</Link>
          <span> » </span>
          <span>正文</span>
        </div>
        <h2 className="md:mb-2 dark:text-white">{title}</h2>
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