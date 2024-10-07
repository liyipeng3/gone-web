'use client'

import { useState } from 'react'
import CommentItem from './Item'

const List = ({ commentsData, nameMap }: {
  commentsData: any[]
  nameMap: Record<number, string>
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const commentsPerPage = 5
  const totalPages = Math.ceil(commentsData.length / commentsPerPage)

  const indexOfLastComment = currentPage * commentsPerPage
  const indexOfFirstComment = indexOfLastComment - commentsPerPage
  const currentComments = commentsData.slice(indexOfFirstComment, indexOfLastComment)

  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return <>
    {currentComments.map((comment: any) => (
      <CommentItem key={comment.coid} comment={comment} nameMap={nameMap} />
    ))}
    {totalPages > 1 && commentsData.length > 5 && (
      <div className="flex justify-center mt-4 items-center space-x-2">
        <div
          className={`text-gray-700 hover:text-blue-500 hover:underline dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)) }}
        >
          上一页
        </div>
        {pageNumbers.map(number => (
          <div
            key={number}
            className={`${currentPage === number ? 'text-blue-500 dark:text-blue-400 underline' : 'text-gray-700 dark:text-gray-300'} hover:text-blue-500 hover:underline dark:hover:text-blue-400 px-1 cursor-pointer`}
            onClick={() => { setCurrentPage(number) }}
          >
            {number}
          </div>
        ))}
        <div
          className={`text-gray-700 hover:text-blue-500 hover:underline dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)) }}
        >
          下一页
        </div>
      </div>
    )}
  </>
}

export default List
