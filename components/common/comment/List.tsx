'use client'

import { useState } from 'react'
import CommentItem from './Item'

const List = ({ initialNum, addNum, commentsData, nameMap }: {
  initialNum: number
  addNum: number
  commentsData: any[]
  nameMap: Record<number, string>
}) => {
  const [visibleComments, setVisibleComments] = useState(initialNum)

  return <> {commentsData.slice(0, visibleComments).map((comment: any) => (
    <CommentItem key={comment.coid} comment={comment} nameMap={nameMap} />
  ))}
    {visibleComments < commentsData.length && (
      <div className="flex justify-center">
        <div
          className='cursor-pointer text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
          onClick={() => {
            setVisibleComments(visibleComments + addNum)
          }}
        >
          查看更多评论
        </div>
      </div>
    )}
  </>
}

export default List
