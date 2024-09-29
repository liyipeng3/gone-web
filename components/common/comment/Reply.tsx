// 创建一个新的客户端组件来处理回复按钮的交互
'use client'

import { useState } from 'react'
import CommentForm from './Form'

const Reply = ({ comment }: { comment: any }) => {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <>
      <span
        className="text-xs text-gray-400 cursor-pointer hover:text-gray-500 float-right items-end absolute right-0 bottom-0"
        onClick={() => { setShowReplyForm(!showReplyForm) }}
      >
        {showReplyForm ? '取消' : '回复'}
      </span>
      {showReplyForm && (
        <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
          <CommentForm cid={comment.cid} parent={comment.coid} />
        </div>
      )}
    </>
  )
}

export default Reply
