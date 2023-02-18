// import { useRouter } from 'next/router'
import React from 'react'
import Sidebar from '@/components/common/sidebar'
import marked from '@/utils/marked'
import Prose from '@/components/common/prose'
import prisma from '@/utils/prisma'
import Head from 'next/head'
import dayjs from 'dayjs'
import Link from 'next/link'

interface ContentProps {
  title: string
  content: string
  created: number
  name: string
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
  return {
    props: {
      title: article.contents.title,
      content,
      created: article.contents.created,
      name: article.metas.name
    } // will be passed to the page component as props
  }
}

const Content: React.FC<ContentProps> = ({
  title,
  content,
  created,
  name
}) => {
  // const router = useRouter()
  // const {
  //   category,
  //   id
  // } = router.query

  return (
    <div className="flex justify-center items-start min-h-full flex-1 md:py-4 py-4 px-4 md:px-44">
      <Head>
        <title>{`${title} - lyp123`}</title>
      </Head>
      <article className="max-w-full text-left flex-1 prose">
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
      <Sidebar/>
    </div>
  )
}

export default Content
