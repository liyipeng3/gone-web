import React from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { type HotList } from '@/types'
import Main from '@/components/layout/main'
import { type GetServerSideProps } from 'next'
import { getHotList, getPostList } from '@/models/content'
import Pagination from '@/components/common/pagination'
import Breadcrumb from '@/components/common/breadcrumb'
import cn from 'classnames'
import { pageSize } from '@/utils/constants'

export interface PageProps {
  list: any[]
  total: number
  hotList: HotList
  description?: string
  baseLink?: string
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageNum: number = ((context.params?.num ?? context.query.p) as unknown as number) ?? 1
  const search = context.query.q as string ?? ''

  const {
    list,
    total
  } = await getPostList({
    pageNum,
    pageSize,
    search
  })
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
  hotList,
  description,
  baseLink = '/page/'
}) => {
  const router = useRouter()
  const num = router.query.num ?? router.query.p
  const search = router.query.q as string ?? ''
  const currentPage = parseInt((num ?? '1') as string)
  const pageNum = Math.ceil((total ?? 0) / pageSize)
  if (search !== '') {
    baseLink = `/search?q=${search}&p=`
    description = `包含关键字 ${search} 的文章`
  }

  return <Main hotList={hotList}>
    <Head>
      <title>lyp123 - 做自己</title>
    </Head>
    <div className="md:space-y-3 flex flex-col items-start justify-start flex-1 max-w-4xl md:w-auto w-screen">
      {(description != null) && <Breadcrumb items={[{ name: description }]}/>}
      {list.length === 0 &&
        <div className="text-center text-gray-500 dark:text-gray-400 m-auto md:w-[48rem] pt-48">暂无内容</div>}
      {(list)?.map((item, index) => <div className={cn('text-left w-full', index === 0 && 'md:pt-4 mt-5')}
                                         key={item.slug as string}>
        <div className="text-base font-bold dark:text-white">
          <Link href={`/post/${item?.category as string}/${item?.slug as string}`}>{item.title}</Link>
        </div>
        <div className="text-xs text-gray-500 space-x-1.5 mt-2 dark:text-gray-400">
          <span>{dayjs(new Date(item.created * 1000)).format('YYYY-MM-DD')}</span>
          <span className="text-gray-400">•</span>
          <span>{item.name}</span>
          <span className="text-gray-400">•</span>
          <span>{item.viewsNum}人阅读</span>
        </div>
        <div className="text-sm mt-4 text-gray-600 dark:text-gray-300 max-w-3xl break-all text-justify">
          <Link
            href={`/post/${item?.category as string}/${item?.slug as string}`}>
            {item.description !== '' ? item.description.length < 150 ? item.description : item.description as string + '...' : '暂无描述'}
          </Link>
        </div>
        <div className="w-fit mx-auto text-sm text-gray-500 my-5 dark:text-gray-500">
          <Link href={`/post/${item?.category as string}/${item?.slug as string}`}>- 阅读全文 -</Link>
        </div>
      </div>)}
      <Pagination pageNum={pageNum} currentPage={currentPage} baseLink={baseLink}/>
    </div>
  </Main>
}

export default Page
