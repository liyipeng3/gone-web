import React from 'react'
import dayjs from 'dayjs'
import Reply from './Reply'
import { parseEmoji } from '@/lib/emoji'
import dynamic from 'next/dynamic'
import { getUserBrowser, getUserAgent } from '@/lib/utils'

const Avatar = dynamic(async () => await import('./Avatar'), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
})

const CommentItem = ({ comment, nameMap }: { comment: any, nameMap: Record<number, string> }) => {
  return (
    <div
      id={`comment-${comment.coid}`}
      className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-solid border-gray-100 dark:border-gray-700 flex flex-col gap-2">
      <div className="flex gap-2 flex-row align-start">
        <Avatar email={comment.email} author={comment.author} />
        <div>
          <div
            className="text-sm text-gray-700 dark:text-gray-300 gap-1 flex flex-row justify-start items-center flex-wrap">
            <span>{comment.author}</span>
            {comment?.authorId === 1 && <span
                className="text-gray-700 dark:text-gray-300 whitespace-nowrap rounded-sm text-xs px-1.5 border border-solid border-gray-100 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">Author</span>}
            <span
              className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightsteelblue] dark:bg-[#4682B4]">{getUserBrowser(comment.agent)}</span>
            <span
              className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightslategrey] dark:bg-[#708090]">{getUserAgent(comment.agent)}</span>
          </div>
          <p
            className="text-sm text-gray-600 dark:text-gray-400">{dayjs(comment.created * 1000).format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 relative">
        {comment.parent ? <span className="font-bold">回复 {nameMap[comment.parent]}: </span> : null}
        <span>{parseEmoji(comment.text)}</span>
        <Reply comment={comment} nameMap={nameMap} />
      </div>
    </div>
  )
}

export default CommentItem
