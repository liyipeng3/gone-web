'use client'
import React, { useState } from 'react'
import useAsyncEffect from 'ahooks/lib/useAsyncEffect'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
interface CommentListProps {
  cid: number
}

const CommentList: React.FC<CommentListProps> = ({ cid }) => {
  const [comments, setComments] = useState<any[]>([])

  useAsyncEffect(async () => {
    const fetchComments = async () => {
      const commentsData = await fetch(`/api/comment/${cid}`).then(async res => await res.json())
      const commentsWithChildren = commentsData.map((comment: any) => {
        if (comment.parent) {
          const parent = commentsData.find((c: any) => c.coid === comment.parent)
          if (parent) {
            parent.children = [...(parent.children || []), comment]
          }
        }
        return comment
      })
      setComments(commentsWithChildren)
    }
    await fetchComments()
  }, [cid])

  return (
    <>
      {comments.length > 0 && (
        <div className="p-4  rounded-lg border border-solid border-gray-100 text-left">
          <h3 className="text-xl font-bold mb-4">评论</h3>
        {comments.map(comment => comment.parent === 0 && (
          <CommentItem key={comment.coid} comment={comment}/>
        ))}
        </div>
      )}
      <div className="p-4 rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] mt-4 text-left">
        <h3 className="text-xl font-bold mb-4">添加新评论</h3>
        <CommentForm cid={cid}/>
      </div>
    </>
  )
}

export default CommentList
