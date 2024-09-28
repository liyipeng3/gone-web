'use client'
import React, { useState } from 'react'
import useAsyncEffect from 'ahooks/lib/useAsyncEffect'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
interface CommentListProps {
  cid: number
  title?: string
}

const CommentList: React.FC<CommentListProps> = ({ cid, title = '评论' }) => {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
    setIsLoading(false)
  }, [cid])

  return (
    <>
      {isLoading
        ? <div className='flex justify-center items-center h-full'>
          加载中...
        </div>
        : (
        <>
      {comments.length > 0 && (
        <div className="py-4 rounded-lg text-left">
          <h3 className="text-lg font-bold mb-4">{comments.length}条{title}</h3>
        {comments.map(comment => comment.parent === 0 && (
          <CommentItem key={comment.coid} comment={comment}/>
        ))}
        </div>
      )}
      <div className="p-4 rounded-lg border border-solid border-gray-100 mt-4 text-left dark:border-gray-800">
        <h3 className="text-xl font-bold mb-4">添加新评论</h3>
        <CommentForm cid={cid}/>
      </div>
      </>
          )}
    </>
  )
}

export default CommentList
