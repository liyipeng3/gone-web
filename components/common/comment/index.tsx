import React from 'react'
import { getCommentsByCid } from '@/models/comments'
import { getCurrentUser } from '@/lib/session'
import Comments from './Comment'

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
    <Comments
      commentsData={commentsData}
      nameMap={nameMap}
      cid={cid}
      user={user}
    />
  )
}

export default CommentList
