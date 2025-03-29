import React from 'react'
import CommentForm from './Form'
import { getCommentsByCid } from '@/models/comments'
import List from './List'
import { getCurrentUser } from '@/lib/session'

interface CommentListProps {
  cid: number
  title?: string
  initialComments?: number
}

const CommentList: React.FC<CommentListProps> = async ({ cid, title = '评论', initialComments = 5 }) => {
  const commentsData = await getCommentsByCid(cid)
  const user = await getCurrentUser()

  const nameMap: Record<number, string> = {}
  commentsData.forEach((comment: any) => {
    nameMap[comment.coid] = comment.author
  })

  return (
    <>
      {commentsData.length > 0 && (
        <div className="py-4 rounded-lg text-left">
          <h3 className="text-lg font-bold mb-4">{commentsData.length}条{title}</h3>
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

export default CommentList
