import React from 'react'
import CommentItem from './Item'
import CommentForm from './Form'
import { getCommentsByCid } from '@/models/comments'

interface CommentListProps {
  cid: number
  title?: string
}

const CommentList: React.FC<CommentListProps> = async ({ cid, title = '评论' }) => {
  const commentsData = await getCommentsByCid(cid)

  const commentsWithChildren = commentsData.map((comment: any) => {
    if (comment.parent) {
      const parent = commentsData.find((c: any) => c.coid === comment.parent)
      if (parent) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        parent.children = [...(parent.children || []), comment]
      }
    }
    return comment
  })

  return (
    <>
      {commentsWithChildren.length > 0 && (
        <div className="py-4 rounded-lg text-left">
          <h3 className="text-lg font-bold mb-4">{commentsWithChildren.length}条{title}</h3>
          {commentsWithChildren.map((comment: any) => comment.parent === 0 && (
            <CommentItem key={comment.coid} comment={comment}/>
          ))}
        </div>
      )}
      <div className="p-4 rounded-lg border border-solid border-gray-100 mt-4 text-left dark:border-gray-800">
        <h3 className="text-xl font-bold mb-4">添加新评论</h3>
        <CommentForm cid={cid}/>
      </div>
    </>
  )
}

export default CommentList
