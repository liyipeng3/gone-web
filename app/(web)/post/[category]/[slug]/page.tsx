import React from 'react'
import Prose from '@/components/common/prose'
import dayjs from 'dayjs'
import Main from '@/components/layout/main'
import Breadcrumb from '@/components/common/breadcrumb'
import { getPagePostInfo } from '@/services/post'
import PostView from '@/components/custom/View/post'
import { type Metadata } from 'next/types'
import Link from 'next/link'
import { getCommentsByCid } from '@/models/comments'
import { calculateReadingTime, getWordCount } from '@/lib/readingTime'
import CommentList from '@/components/common/comment'
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
    createdAt,
    name,
    category,
    viewsNum,
    cid,
    likesNum,
    tags
  } = await getPagePostInfo({ slug: params.slug })

  const comments = cid ? await getCommentsByCid(cid) : []
  const commentsNum = comments.length

  const readingTime = calculateReadingTime(content)
  const wordCount = getWordCount(content)

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
            <span>{dayjs(createdAt).format('YYYY-MM-DD HH:MM')}</span>
            <span>•</span>
            <Link href={`/category/${category as string}`}
                  className="text-gray-500 dark:text-gray-400 no-underline font-normal">{name}</Link>
            <span>•</span>
            <span>{viewsNum}人阅读</span>
            {commentsNum > 0 && <span>•</span>}
            {commentsNum > 0 && <span>{commentsNum}条评论</span>}
            {likesNum > 0 && <span>•</span>}
            {likesNum > 0 && <span>{likesNum}人喜欢</span>}
            <span>•</span>
            <span>约 {wordCount} 字</span>
            <span>•</span>
            <span>阅读时间 {readingTime} 分钟</span>
          </div>
          <Prose content={content}/>
        </article>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">标签：</span>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center my-8 py-4">
          <div className="flex items-center gap-2">
            <LikeButton cid={cid as number} initialLikes={likesNum} />
          </div>
        </div>
        <div className="text-xs mb-5 -mt-3 md:mt-3 my-3 text-gray-400 space-x-1.5 dark:text-gray-500">
          本作品采用 <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 font-normal hover:underline">知识共享署名-相同方式共享 4.0 国际许可协议</a> 进行许可。
        </div>
        <CommentList cid={cid as number}/>
      </div>
      <PostView cid={cid as number}/>
    </Main>
  )
}

export default Content
