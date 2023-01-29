import React from 'react'
import db from '@utils/db'
import Link from 'next/link'
import dayjs from 'dayjs'
import Sidebar from '@components/common/sidebar'
import { useRouter } from 'next/router'
import cn from 'classnames'

export interface PageProps {
  list: any[]
  total: number
}

const pageSize = 7

export async function getServerSideProps (context: { params: { page: number } }) {
  const page = context.params?.page ?? 1

  const res = await db.query('select contents.text as text, title, contents.slug as slug, created, modified, metas.slug as category, name from contents inner join relationships on contents.cid = relationships.cid inner join metas on relationships.mid = metas.mid where contents.status = ? and metas.type = ?', ['publish', 'category'], page, pageSize, true)
  return {
    props: {
      list: res,
      total: res.total
    }
  }
}

const Page: React.FC<PageProps> = ({
  list,
  total
}) => {
  const router = useRouter()
  const { page = '1' } = router.query
  const currentPage = parseInt(page as string)
  const pageNum = Math.ceil((total ?? 0) / pageSize)
  const pageArr = [...(new Array(pageNum)).fill(null)]
  const pagination = pageArr.map((_, index) =>
    (<Link key={index}
           className={cn('px-1 hover:border-b hover:text-black hover:transition-all border-inherit', (index + 1) === currentPage ? 'border-b ' : 'text-gray-300')}
           href={`/page/${index + 1}`}>{index + 1}</Link>))
  return <div className="relative px-32 py-6 flex">
    <div className=" py-6 space-y-3 flex flex-col items-start justify-start flex-1 w-[70%] mx-auto">{
      (list)?.map(item => <Link className="text-left w-full" key={item.slug as string}
                                href={`/article/${item?.category as string}/${item?.slug as string}`}>
        <div className="text-base font-bold dark:text-white">{item.title}</div>
        <div className="text-xs text-gray-500 space-x-3 mt-2 dark:text-gray-400">
          <span>{dayjs(new Date(item.created * 1000)).format('YYYY-MM-DD')}</span>
          <span>{item.name}</span>
        </div>
        <div className="text-sm mt-4 text-gray-600 dark:text-gray-300 w-full"
             dangerouslySetInnerHTML={{ __html: item.text?.split('<!--more-->')[0].slice(15, 150) }}/>
        <div className="text-center text-sm text-gray-500 my-5 dark:text-gray-00">- 阅读全文 -</div>
      </Link>)
    }
      <div className="text-center space-x-10 w-full  border-black text-sm pt-10 pb-5 flex-row flex justify-center">
        { currentPage !== 1 && <Link href={`/page/${parseInt(page as string) - 1}`} className="border-inherit hover:border-b">上一页</Link> }
        <div className='space-x-3'>
        {
          pagination
        }
        </div>
        { currentPage !== pageNum && <Link href={`/page/${parseInt(page as string) + 1}`} className="border-inherit hover:border-b">下一页</Link> }
      </div>
    </div>
    <Sidebar/>
  </div>
}

export default Page
