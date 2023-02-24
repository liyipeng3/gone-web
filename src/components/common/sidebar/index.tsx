import { type FC, useEffect, useState } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { type HotList } from '@/types'

interface SidebarProps {
  hotList?: HotList
}

const Sidebar: FC<SidebarProps> = ({ hotList = [] }) => {
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
      <div className="text-left max-w-[18rem]">
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
    </div>
  )
}

export default Sidebar
