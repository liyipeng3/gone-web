'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface CommentActionsProps {
  comment: {
    [key: string]: any
    coid?: number
    cid?: number | null
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
      const response = await fetch(`/api/comment/${comment.coid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coid: comment.coid, comment: { status: newStatus } })
      })
      if (response.ok) {
        setStatus(newStatus)
        router.refresh()
      } else {
        throw new Error('更新状态失败')
      }
    } catch (error) {
      console.error('更新评论状态时出错:', error)
      toast({
        title: '更新评论状态失败',
        description: '请重试',
        variant: 'destructive'
      })
    }
  }

  // 使用简单的编辑框编辑和回复，而不是跳转到新的页面
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [type, setType] = useState<'edit' | 'reply'>('edit')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setType('edit')
    setIsEditing(true)
    setEditedText(comment.text ?? '')
  }

  const handleReply = () => {
    setEditedText('')
    setType('reply')
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这条评论吗？此操作不可撤销。')) {
      try {
        const response = await fetch('/api/comment/0', {
          method: 'DELETE',
          body: JSON.stringify({ coid: comment.coid })
        })
        if (response.ok) {
          router.refresh()
        } else {
          throw new Error('删除失败')
        }
      } catch (error) {
        console.error('删除评论时出错:', error)
        toast({
          title: '删除评论失败',
          description: '请重试',
          variant: 'destructive'
        })
      }
    }
  }

  const handleSave = async () => {
    const text = editedText.trim()
    if (!text) {
      toast({ title: '内容不能为空', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      let response: Response
      if (type === 'edit') {
        // 编辑评论正文
        response = await fetch(`/api/comment/${comment.coid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coid: comment.coid, comment: { text } })
        })
      } else {
        // 管理员回复：作者身份由服务端 session 派生，仅提交正文与被回复评论 id
        response = await fetch(`/api/comment/${comment.cid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, parent: comment.coid })
        })
      }

      if (!response.ok) {
        throw new Error(type === 'edit' ? '保存失败' : '回复失败')
      }

      toast({
        title: type === 'edit' ? '评论已更新' : '回复成功',
        variant: 'success'
      })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('操作评论时出错:', error)
      toast({
        title: type === 'edit' ? '保存失败' : '回复失败',
        description: '请重试',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className={`text-xs  ${status === 'approved' ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'text-green-600 dark:text-green-400 hover:underline cursor-pointer'}`}
          onClick={async () => await (status !== 'approved' && handleStatusChange('approved'))}
        >
          通过
        </div>
        <div
          className={`text-xs  ${status === 'waiting' ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'}`}
          onClick={async () => await (status !== 'waiting' && handleStatusChange('waiting'))}
        >
          待审核
        </div>
        <div
          className={`text-xs  ${status === 'spam' ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'text-red-600 dark:text-red-400 hover:underline cursor-pointer'}`}
          onClick={async () => await (status !== 'spam' && handleStatusChange('spam'))}
        >
          垃圾
        </div>
        <div
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          onClick={handleEdit}
        >
          编辑
        </div>
        <div
          className="text-xs text-gray-800 dark:text-gray-300 hover:underline cursor-pointer"
          onClick={handleReply}
        >
          回复
        </div>
        <div
          className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          onClick={handleDelete}
        >
          删除
        </div>

      </div>
      {isEditing && (
        <div className="mt-2 space-y-2">
          <textarea
            value={editedText}
            onChange={(e) => { setEditedText(e.target.value) }}
            rows={3}
            autoFocus
            placeholder={type === 'edit' ? '编辑评论内容…' : '输入回复内容…'}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? '提交中…' : type === 'edit' ? '保存' : '回复'}
            </button>
            <button
              onClick={() => { setIsEditing(false) }}
              disabled={isSaving}
              className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  )
}
