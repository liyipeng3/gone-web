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

interface ContentProps {
  title: string
  content: string
  created: number
  name: string
  hotList: HotList
}

export async function getServerSideProps (context: { params: { slug: any } }) {
  const data = await prisma.relationships.findMany({
    include: {
      metas: {
        select: {
          name: true
        }
      },
      contents: {
        select: {
          title: true,
          text: true,
          created: true
        }
      }
    },
    where: {
      contents: {
        slug: context.params.slug
      }
    }
  })
  if (data === null || data.length === 0) {
    return {
      notFound: true
    }
  }
  const article = data[0]

  const content = marked.parse(article.contents.text ?? '')

  const hotList = await getHotList()

  return {
    props: {
      title: article.contents.title,
      content,
      created: article.contents.created,
      name: article.metas.name,
      hotList
    } // will be passed to the page component as props
  }
}

const Content: React.FC<ContentProps> = ({
  title,
  content,
  created,
  name,
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
        </div>
        <Prose content={content}/>
      </article>
    </Main>
  )
}

export default Content
