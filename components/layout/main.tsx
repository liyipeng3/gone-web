import React from 'react'
import Sidebar from '@/components/common/sidebar'
import { getRecentComments } from '@/models/comments'
import { getTags } from '@/models/tags'
import { getHotList } from '@/models/posts'
import { getLinks } from '@/models/links'

export interface MainProps {
  children: React.ReactNode
}

const Main: React.FC<MainProps> = async ({
  children
}) => {
  // 获取最近回复、标签和邻居数据
  const recentComments = await getRecentComments()
  const tags = await getTags()
  const hotList = await getHotList()
  const links = await getLinks(10) // 获取10个友情链接

  return <div
    className="relative lg:max-w-7xl md:max-w-5xl max-w-full m-auto px-4 py-3 flex items-start mt-0 justify-between gap-x-12 lg:min-w-[64rem] md:min-w-[48rem]">
    {children}
    <Sidebar hotList={hotList} recentComments={recentComments} tags={tags} links={links}/>
  </div>
}

export default Main
