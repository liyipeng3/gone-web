'use client'
import { type FC, useEffect, useState } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { type HotList } from '@/types'

interface SidebarProps {
  hotList?: HotList
  recentComments?: any[]
  tags?: any[]
  links?: any[]
}

const Sidebar: FC<SidebarProps> = ({ hotList = [], recentComments = [], tags = [], links = [] }) => {
  const [sticky, setSticky] = useState(false)
  useEffect(() => {
    const sidebar = document.getElementById('sidebar') ?? { clientHeight: 0 }
    if (sidebar.clientHeight < document.documentElement.clientHeight) {
      setSticky(false)
    } else {
      setSticky(true)
    }
  }, [])
  return (
    <div id="sidebar"
         className={cn('sticky h-fit py-4 md:block hidden', sticky ? 'bottom-0 self-end' : 'top-0 self-start')}>
      <div className="text-left max-w-[18rem] space-y-8">
        {/* 热门文章 */}
        <div>
          <div className="text-lg font-bold">热门文章</div>
          <div className="text-sm space-y-2 mt-3 text-gray-600 dark:text-gray-300">
            {hotList.map(item => (
              <div key={item.slug} className="hover:text-black hover:transition-all dark:hover:text-white">
                <Link href={`/post/${item.category}/${item.slug}`}>
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* 最近回复 */}
        {recentComments.length > 0 && (
          <div>
            <div className="text-lg font-bold">最近回复</div>
            <div className="text-sm space-y-2 mt-3 text-gray-600 dark:text-gray-300">
              {recentComments.map(comment => (
                <div key={comment.coid} className="hover:text-black hover:transition-all dark:hover:text-white">
                  <Link href={`/post/${comment.posts?.category}/${comment.posts?.slug}#comment-${comment.coid}`}>
                    <span className="line-clamp-1">{comment.author}: {comment.text}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 标签 */}
        {tags.length > 0 && (
          <div>
            <div className="text-lg font-bold">标签</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map(tag => (
                <Link
                  key={tag.mid}
                  href={`/tag/${tag.slug}`}
                  className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag.name} ({tag.count})
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* 邻居 */}
        {links.length > 0 && (
          <div>
            <div className="text-lg font-bold">邻居</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {links.slice(0, 8).map(link => (
                <Link
                  key={link.lid}
                  href={link.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="text-left mt-2">
              <Link
                href="/links"
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                查看更多...
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
