import React from 'react'
import db from '@utils/db'
import Link from 'next/link'
import dayjs from 'dayjs'
import Sidebar from '@components/common/sidebar'

export interface PageProps {
  list: any[]
}

export async function getServerSideProps (context: { params: { page: number } }) {
  const page = context.params?.page ?? 1

  const res = await db.query('select contents.text as text, title, contents.slug as slug, created, modified, metas.slug as category, name from contents inner join relationships on contents.cid = relationships.cid inner join metas on relationships.mid = metas.mid where contents.status = ? and metas.type = ?', ['publish', 'category'], page, 7)
  return {
    props: {
      list: res
    }
  }
}

const Page: React.FC<PageProps> = ({ list }) => {
  return <div className='flex flex-row justify-center px-32 py-12'>
    <div className="space-y-3 flex flex-col items-start justify-start flex-1 w-[70%] mx-auto">{
      list?.map(item => <Link className="text-left w-full" key={item.slug as string}
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
    </div>
    <Sidebar/>
  </div>
}

export default Page
