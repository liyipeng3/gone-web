import React from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import cn from 'classnames'
import prisma from '@/utils/prisma'
import Head from 'next/head'
import { type HotList } from '@/types'
import { getHotList } from '@/services/contents'
import Main from '@/components/layout/main'
import { marked } from 'marked'

export interface PageProps {
  list: any[]
  total: number
  hotList: HotList
}

const pageSize = 7

export async function getServerSideProps (context: { params: { num: number } }) {
  const pageNum = context.params?.num ?? 1

  const data = await prisma.relationships.findMany({
    include: {
      contents: {
        select: {
          title: true,
          slug: true,
          created: true,
          modified: true,
          text: true
        }
      },
      metas: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    where: {
      metas: {
        type: 'category'
      },
      contents: {
        status: 'publish',
        type: 'post'
      }
    },
    orderBy: {
      contents: {
        created: 'desc'
      }
    },
    skip: (pageNum - 1) * pageSize,
    take: pageSize
  })
  const total = await prisma.contents.count({
    where: {
      status: 'publish',
      type: 'post'
    }
  })

  const list = data.map(item => ({
    ...item.contents,
    category: item.metas.slug,
    name: item.metas.name
  })).map(item => ({
    ...item,
    description: marked.parse((item.text?.split('<!--more-->')[0].slice(15, 150).split('`')[0]) ?? '').toString().replaceAll(/<.*?>/g, '')
  }))

  const hotList = await getHotList()

  return {
    props: {
      list,
      total,
      hotList
    }
  }
}

const Page: React.FC<PageProps> = ({
  list,
  total,
  hotList
}) => {
  const router = useRouter()
  const { num = '1' } = router.query
  const currentPage = parseInt(num as string)
  const pageNum = Math.ceil((total ?? 0) / pageSize)
  const pageArr = [...(new Array(pageNum)).fill(null)]
  const pagination = pageArr.map((_, index) =>
    (<Link key={index}
           className={cn('px-1 hover:border-b hover:text-black dark:hover:text-white hover:transition-all border-inherit dark:border-gray-500', (index + 1) === currentPage ? 'border-b ' : 'text-gray-300')}
           href={`/page/${index + 1}`}>{index + 1}</Link>))
  return <Main hotList={hotList}>
    <Head>
      <title>lyp123 - 做自己</title>
    </Head>
    <div className="md:py-6 py-4 md:space-y-3 flex flex-col items-start justify-start flex-1 max-w-4xl">{
      (list)?.map(item => <div className="text-left w-full" key={item.slug as string}>
        <Link href={`/article/${item?.category as string}/${item?.slug as string}`}>
          <div className="text-base font-bold dark:text-white">{item.title}</div>
        </Link>
        <div className="text-xs text-gray-500 space-x-3 mt-2 dark:text-gray-400">
          <span>{dayjs(new Date(item.created * 1000)).format('YYYY-MM-DD')}</span>
          <span>{item.name}</span>
        </div>
        <Link href={`/article/${item?.category as string}/${item?.slug as string}`}>
          <div className="text-sm mt-4 text-gray-600 dark:text-gray-300 max-w-3xl"
          >{item.description !== '' ? item.description : '暂无描述'}</div>
        </Link>
        <Link href={`/article/${item?.category as string}/${item?.slug as string}`}>
          <div className="w-fit mx-auto text-sm text-gray-500 my-5 dark:text-gray-500">- 阅读全文 -</div>
        </Link>
      </div>)
    }
      <div
        className="text-center md:space-x-10 space-x-5 w-full py-2  border-black text-sm md:pt-10 md:pb-5 flex-row flex justify-center">
        {currentPage !== 1 &&
          <Link href={`/page/${currentPage - 1}`} className="border-inherit hover:border-b">上一页</Link>}
        <div className="md:space-x-3 space-x-1 border-inherit">
          {
            pagination
          }
        </div>
        {currentPage !== pageNum &&
          <Link href={`/page/${currentPage + 1}`} className="border-inherit hover:border-b">下一页</Link>}
      </div>
    </div>
  </Main>
}

export default Page
