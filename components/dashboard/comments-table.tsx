'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { getAvatarUrl } from '@/lib/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import CommentActions from '@/components/common/comment/Action'
import { toast } from '@/components/ui/use-toast'

interface CommentMeta {
  slug?: string | null
}

interface CommentPost {
  title?: string | null
  slug?: string | null
  relationships?: Array<{ metas?: CommentMeta | null }>
}

export interface CommentRow {
  coid: number
  cid?: number | null
  createdAt?: Date | string | null
  author?: string | null
  email?: string | null
  ip?: string | null
  text?: string | null
  status?: string | null
  posts?: CommentPost | null
}

interface CommentsTableProps {
  comments: CommentRow[]
  filter: string
  page: number
}

const emptyLabel: Record<string, string> = {
  approved: '已通过',
  waiting: '待审核',
  spam: '垃圾'
}

export default function CommentsTable ({ comments, filter, page }: CommentsTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const allSelected = comments.length > 0 && selected.size === comments.length
  const someSelected = selected.size > 0 && !allSelected

  const selectedIds = useMemo(() => Array.from(selected), [selected])

  const toggleOne = (coid: number, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(coid)
      } else {
        next.delete(coid)
      }
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(comments.map(c => c.coid)) : new Set())
  }

  const clearSelection = () => { setSelected(new Set()) }

  const removeSelection = (coid: number) => {
    setSelected(prev => {
      if (!prev.has(coid)) return prev
      const next = new Set(prev)
      next.delete(coid)
      return next
    })
  }

  // 删除或移出当前筛选后，若整页清空且非首页，回退到上一页避免停留在空页
  const refreshAfterMutation = (removedCount: number) => {
    const willBeEmpty = removedCount >= comments.length
    if (willBeEmpty && page > 1) {
      const params = new URLSearchParams()
      params.set('filter', filter)
      params.set('page', String(page - 1))
      router.push(`/dashboard/comments?${params.toString()}`)
    } else {
      router.refresh()
    }
  }

  const handleBatchSpam = async () => {
    if (selectedIds.length === 0) return
    setIsProcessing(true)
    try {
      const response = await fetch('/api/comment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coids: selectedIds, status: 'spam' })
      })
      if (!response.ok) throw new Error('批量更新失败')

      toast({ title: `已将 ${selectedIds.length} 条评论标记为垃圾`, variant: 'success' })
      // 非「垃圾/全部」筛选下，被标记的评论会移出当前列表
      const movesOut = filter !== 'spam' && filter !== 'all'
      clearSelection()
      refreshAfterMutation(movesOut ? selectedIds.length : 0)
    } catch (error) {
      console.error('批量标记垃圾失败:', error)
      toast({ title: '批量标记垃圾失败', description: '请重试', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 批量操作栏：选中 > 0 时浮现 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950 px-4 py-2.5">
          <span className="text-sm text-gray-700 dark:text-gray-200">
            已选择 <span className="font-semibold">{selectedIds.length}</span> 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void handleBatchSpam() }}
              disabled={isProcessing}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900 disabled:opacity-50"
            >
              批量标记垃圾
            </button>
            <button
              onClick={clearSelection}
              disabled={isProcessing}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(checked) => { toggleAll(checked === true) }}
                  aria-label="全选"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 w-64">作者信息</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">评论内容</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 w-24">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <tr key={comment.coid} className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <td className="px-4 py-5">
                  <Checkbox
                    checked={selected.has(comment.coid)}
                    onCheckedChange={(checked) => { toggleOne(comment.coid, checked === true) }}
                    aria-label={`选择 ${comment.author ?? ''} 的评论`}
                  />
                </td>
                <td className="px-4 py-5">
                  <div className=" space-x-3 h-full flex items-center justify-start">
                    <div className="relative flex-shrink-0 h-full ">
                      <Image
                        src={getAvatarUrl(comment.email ?? '')}
                        alt={`${comment.author}的头像`}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                        width={40}
                        height={40}
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                        comment.status === 'approved'
                          ? 'bg-green-500'
                          : comment.status === 'waiting' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="min-w-0 h-full flex flex-col justify-center items-start">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {comment.author}
                      </div>
                      <a
                        className="block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors truncate"
                        href={`mailto:${comment.email}`}
                      >
                        {comment.email}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="truncate">{comment.ip}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                      <time className="font-medium whitespace-nowrap">
                        {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                      </time>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">评论于</span>
                      <a
                        target="_blank"
                        href={`/post/${comment.posts?.relationships?.[0]?.metas?.slug}/${comment.posts?.slug}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors truncate max-w-xs"
                        title={comment.posts?.title ?? '未知文章'}
                      >
                        {comment.posts?.title ?? '未知文章'}
                      </a>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-3">
                      {comment.text}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1">
                      <CommentActions
                        comment={comment}
                        onDeleted={() => {
                          removeSelection(comment.coid)
                          refreshAfterMutation(1)
                        }}
                        onStatusChanged={(newStatus) => {
                          // 新状态与当前筛选不一致（且非「全部」）时，该条移出当前列表
                          const movesOut = filter !== 'all' && newStatus !== filter
                          if (movesOut) {
                            removeSelection(comment.coid)
                          }
                          refreshAfterMutation(movesOut ? 1 : 0)
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      comment.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : comment.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {comment.status === 'approved'
                        ? '已通过'
                        : comment.status === 'waiting' ? '待审核' : '垃圾'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comments.length === 0 && (
        <div className="text-center py-16">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">💬</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              暂无{emptyLabel[filter] ?? '相关'}评论
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-xs">
              当前筛选条件下没有找到相关评论
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
