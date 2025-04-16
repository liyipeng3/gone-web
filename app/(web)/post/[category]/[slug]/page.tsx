import React from 'react'
import Prose from '@/components/common/prose'
import dayjs from 'dayjs'
import Main from '@/components/layout/main'
import Breadcrumb from '@/components/common/breadcrumb'
import { getPagePostInfo } from '@/services/post'
import PostView from '@/components/custom/View/post'
import { type Metadata } from 'next/types'
import CommentList from '@/components/common/comment'
import Link from 'next/link'
import LikeButton from '@/components/common/like-button'

export async function generateMetadata (
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const {
    title
  } = await getPagePostInfo({ slug: params.slug })

  return {
    title
  }
}

const Content: React.FC<{ params: { slug: string } }> = async (
  { params }) => {
  const {
    title,
    content,
    created,
    name,
    category,
    viewsNum,
    cid,
    likesNum
  } = await getPagePostInfo({ slug: params.slug })

  return (
    <Main>
      <div className="md:max-w-3xl max-w-full md:min-w-[48rem] min-w-[88vw]">
        <article className="md:max-w-3xl max-w-full md:min-w-[48rem] text-left flex-1 prose min-h-[22vh]">
          <Breadcrumb items={[{
            name,
            href: `/category/${category as string}`
          }, { name: '正文' }]}/>
          <h2 className="md:mb-2 mt-4 dark:text-white">{title}</h2>
          <div className="text-xs mb-5 -mt-3 md:mt-3 my-3 text-gray-500 space-x-1.5 dark:text-gray-400 ">
            <span>{dayjs(new Date(created * 1000)).format('YYYY-MM-DD HH:MM')}</span>
            <span>•</span>
            <Link href={`/category/${category as string}`}
                  className="text-gray-500 dark:text-gray-400 no-underline font-normal">{name}</Link>
            <span>•</span>
            <span>{viewsNum}人阅读</span>
          </div>
          <Prose content={content}/>
        </article>
        <div className="flex justify-center items-center my-8 py-4">
          <div className="flex items-center gap-2">
            <LikeButton cid={cid as number} initialLikes={likesNum} />
          </div>
        </div>
        <CommentList cid={cid as number}/>
      </div>
      <PostView cid={cid as number}/>
    </Main>
  )
}

export default Content
