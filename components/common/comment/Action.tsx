'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CommentActionsProps {
  comment: {
    [key: string]: any
    coid?: number
    status?: string | null
    text?: string | null
    // 其他必要的评论属性
  }
}

export default function CommentActions ({ comment }: CommentActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(comment.status)

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/comments/${comment.coid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setStatus(newStatus)
        router.refresh()
      } else {
        throw new Error('更新状态失败')
      }
    } catch (error) {
      console.error('更新评论状态时出错:', error)
      alert('更新评论状态失败，请重试')
    }
  }

  // 使用简单的编辑框编辑和回复，而不是跳转到新的页面
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [type, setType] = useState<'edit' | 'reply'>('edit')

  const handleEdit = () => {
    setType('edit')
    setIsEditing(true)
    setEditedText(comment.text)
  }

  const handleReply = () => {
    setEditedText('')
    setType('reply')
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这条评论吗？此操作不可撤销。')) {
      try {
        const response = await fetch(`/api/comments/${comment.coid}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          router.refresh()
        } else {
          throw new Error('删除失败')
        }
      } catch (error) {
        console.error('删除评论时出错:', error)
        alert('删除评论失败，请重试')
      }
    }
  }

  const handleSave = () => {
    if (type === 'edit') {
      // 编辑评论
    } else if (type === 'reply') {
      // 回复评论
    }
  }

  return (
        <>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    className={`text-xs  ${status === 'approved' ? 'text-gray-400 cursor-default' : 'text-green-600 hover:underline cursor-pointer'}`}
                    onClick={async () => await (status !== 'approved' && handleStatusChange('approved'))}
                >
                    通过
                </div>
                <div
                    className={`text-xs  ${status === 'waiting' ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:underline cursor-pointer'}`}
                    onClick={async () => await (status !== 'waiting' && handleStatusChange('waiting'))}
                >
                    待审核
                </div>
                <div
                    className={`text-xs  ${status === 'spam' ? 'text-gray-400 cursor-default' : 'text-red-600 hover:underline cursor-pointer'}`}
                    onClick={async () => await (status !== 'spam' && handleStatusChange('spam'))}
                >
                    垃圾
                </div>
                <div
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                    onClick={handleEdit}
                >
                    编辑
                </div>
                <div
                    className="text-xs text-gray-800  hover:underline cursor-pointer"
                    onClick={handleReply}
                >
                    回复
                </div>
                <div
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                    onClick={handleDelete}
                >
                    删除
                </div>

            </div>
            {isEditing && (
                <div>
                    <textarea value={editedText} onChange={(e) => { setEditedText(e.target.value) }} />
                    <button onClick={handleSave}>{type === 'edit' ? '保存' : '回复'}</button>
                    <button onClick={() => { setIsEditing(false) }}>取消</button>
                </div>
            )}
        </>
  )
}
