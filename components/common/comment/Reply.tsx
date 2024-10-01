'use client'

import { useState } from 'react'
import CommentForm from './Form'

const Reply = ({ comment, nameMap }: { comment: any, nameMap: Record<number, string> }) => {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <>
      <div
        className="text-xs text-gray-400 cursor-pointer hover:text-gray-500 float-right items-end absolute right-0 bottom-0 text-nowrap"
        onClick={() => {
          setShowReplyForm(!showReplyForm)
        }}
      >
        {showReplyForm ? '取消' : '回复'}
      </div>
      {showReplyForm && (
        <div className="mt-4 bg-white p-4 rounded-md pb-8">
          <CommentForm cid={comment.cid} parent={comment.coid} nameMap={nameMap} />
        </div>
      )}
    </>
  )
}

export default Reply
