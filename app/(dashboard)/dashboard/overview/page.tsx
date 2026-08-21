import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { getDashboardStats } from '@/models/dashboard'
import { getRecentComments } from '@/models/comments'
import { getAvatarUrl } from '@/lib/avatar'
import { Icons } from '@/components/common/icons'
import { FileText, Image as ImageIcon, MessageSquareText, Eye, Heart, Users } from 'lucide-react'

export const metadata = {
  title: 'Overview'
}

interface StatCardProps {
  label: string
  value: number
  hint?: string
  href?: string
  icon: React.ReactNode
}

function StatCard ({ label, value, hint, href, icon }: StatCardProps) {
  const content = (
    <div className="flex h-full items-start justify-between rounded-lg border bg-white dark:bg-gray-900 p-5 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</p>
        {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
      </div>
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>
    </div>
  )

  return href ? <Link href={href} className="block h-full">{content}</Link> : content
}

export default async function OverviewPage () {
  const [stats, recentComments] = await Promise.all([
    getDashboardStats(),
    getRecentComments(6) as Promise<any[]>
  ])

  return (
    <DashboardShell>
      <DashboardHeader heading="Overview" text="Site data at a glance." />

      {stats.comments.waiting > 0 && (
        <Link
          href="/dashboard/comments?filter=waiting"
          className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
        >
          <MessageSquareText className="h-4 w-4" />
          有 {stats.comments.waiting} 条评论待审核，点击前往处理
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="已发布文章"
          value={stats.posts.published}
          hint={`草稿 ${stats.posts.draft} 篇`}
          href="/dashboard"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="评论总数"
          value={stats.comments.total}
          hint={`已通过 ${stats.comments.approved} · 待审 ${stats.comments.waiting} · 垃圾 ${stats.comments.spam}`}
          href="/dashboard/comments"
          icon={<MessageSquareText className="h-5 w-5" />}
        />
        <StatCard
          label="相册图片"
          value={stats.gallery}
          href="/dashboard/gallery"
          icon={<ImageIcon className="h-5 w-5" />}
        />
        <StatCard
          label="文章总浏览量"
          value={stats.views}
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          label="文章总点赞"
          value={stats.likes}
          icon={<Heart className="h-5 w-5" />}
        />
        <StatCard
          label="站点访问量"
          value={stats.visitTimes}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">最近评论</h2>
          <Link href="/dashboard/comments" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            查看全部
          </Link>
        </div>
        {recentComments.length > 0
          ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentComments.map((comment) => (
              <li key={comment.coid} className="flex items-start gap-3 px-5 py-3">
                <Image
                  src={getAvatarUrl(comment.email ?? '')}
                  alt={`${comment.author}的头像`}
                  width={32}
                  height={32}
                  className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</span>
                    <span>{dayjs(comment.createdAt).format('MM-DD HH:mm')}</span>
                    {comment.posts?.title && (
                      <Link
                        href={`/post/${comment.posts?.category}/${comment.posts?.slug}`}
                        target="_blank"
                        className="truncate text-blue-600 hover:underline dark:text-blue-400"
                        title={comment.posts.title}
                      >
                        {comment.posts.title}
                      </Link>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
            )
          : (
          <div className="flex flex-col items-center gap-2 py-12 text-sm text-gray-400">
            <Icons.comment className="h-6 w-6" />
            暂无评论
          </div>
            )}
      </div>
    </DashboardShell>
  )
}
