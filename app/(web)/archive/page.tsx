import Breadcrumb from '@/components/common/breadcrumb'
import Link from 'next/link'
import { getArchiveList } from '@/models/posts'
import dayjs from 'dayjs'

export const metadata = {
  title: '归档',
  description: '档案'
}

const Archive = async () => {
  const archives = await getArchiveList()

  return (
    <div className='md:max-w-3xl max-w-full text-left flex-1 w-screen lg:w-[48rem] md:w-[36rem] mx-auto px-4 pb-6 pt-2'>
      <Breadcrumb items={[{
        name: '归档',
        href: '/archive'
      }]}/>
      <h2 className="md:mb-1 mt-3 dark:text-white text-lg font-bold">归档</h2>

      <div className="mt-6">
        {archives.map(({ time, posts }) => (
          <div key={time} className="mb-3">
            <h3 className="text-base font-bold mb-2">{time}</h3>
            <ul className="space-y-1 list-disc ml-8">
              {posts.map((post: any) => (
                <li key={post.slug} className="flex items-center list-item">
                  <span className="text-black dark:text-gray-400 text-sm">
                    {dayjs(post.created * 1000).format('MM/DD')}:
                  </span>
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-gray-700 hover:text-black dark:hover:text-white text-sm ml-2"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Archive
