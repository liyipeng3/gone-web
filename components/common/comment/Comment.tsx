'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// 动态导入评论表单组件
const CommentForm = dynamic(async () => await import('./Form'), {
  loading: () => <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
})

// 动态导入评论列表项组件
const List = dynamic(async () => await import('./List'), {
  loading: () => <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
})

interface CommentsProps {
  commentsData: any[]
  nameMap: Record<number, string>
  cid: number
  user: any
}

const Comments: React.FC<CommentsProps> = ({ commentsData, nameMap, cid, user }) => {
  return (
    <>
      {commentsData.length > 0 && (
        <div className="py-4 rounded-lg text-left">
          <h3 className="text-lg font-bold mb-4">{commentsData.length}条评论</h3>
          <List commentsData={commentsData} nameMap={nameMap} />
        </div>
      )}
      <div className="p-4 rounded-lg border border-solid border-gray-100 mt-4 mb-8 text-left dark:border-gray-800">
        <h3 className="text-xl font-bold mb-4">添加新评论</h3>
        <CommentForm cid={cid} nameMap={nameMap} user={user} />
      </div>
    </>
  )
}

export default Comments
