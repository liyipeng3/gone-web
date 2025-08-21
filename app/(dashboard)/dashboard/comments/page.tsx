import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'
import { getAvatarUrl } from '@/lib/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import dayjs from 'dayjs'
import Link from 'next/link'
import CommentActions from '@/components/common/comment/Action'
import Image from 'next/image'
import { Pagination } from '@/components/ui/pagination'

export default async function CommentsPage ({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const filter = searchParams.filter as string || 'approved'

  const page = Number(searchParams.page) || 1
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const whereCondition = filter === 'all'
    ? {}
    : { status: filter }

  const totalComments = await prisma.comments.count({
    where: whereCondition
  })

  const comments = await prisma.comments.findMany({
    where: whereCondition,
    select: {
      coid: true,
      cid: true,
      created: true,
      author: true,
      email: true,
      ip: true,
      text: true,
      status: true,
      posts: {
        select: {
          title: true,
          slug: true,
          relationships: {
            select: {
              metas: {
                select: {
                  slug: true
                }
              }
            },
            where: {
              metas: {
                type: 'category'
              }
            }
          }
        }
      }
    },
    orderBy: {
      created: 'desc'
    },
    skip,
    take: pageSize
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="评论管理" text="管理所有用户评论，审核和处理评论内容。" />

      {/* 优化的筛选器 */}
      <div className="">
        <div className="inline-flex items-center bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-1 gap-0.5">
          {[
            { href: '/dashboard/comments?filter=approved', label: '已通过', status: 'approved' },
            { href: '/dashboard/comments?filter=waiting', label: '待审核', status: 'waiting' },
            { href: '/dashboard/comments?filter=spam', label: '垃圾评论', status: 'spam' }
          ].map(({ href, label, status }) => {
            const isActive = filter === status
            const statusCount = comments.filter(c => c.status === status).length

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <span>{label}</span>
                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 text-xs font-semibold rounded-full ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {statusCount}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 现代化的表格容器 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox />
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
                    <Checkbox />
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
                          {dayjs((comment.created ?? 0) * 1000).format('YYYY-MM-DD HH:mm')}
                        </time>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">评论于</span>
                        <a
                          target="_blank"
                          href={`/post/${comment.posts?.relationships[0]?.metas?.slug}/${comment.posts?.slug}`}
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
                        <CommentActions comment={comment} />
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
                暂无{filter === 'approved' ? '已通过' : filter === 'waiting' ? '待审核' : '垃圾'}评论
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">
                当前筛选条件下没有找到相关评论
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 分页组件 */}
      {totalComments > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalItems={totalComments}
            currentPage={page}
            pageSize={pageSize}
            baseUrl={`/dashboard/comments?filter=${filter}`}
          />
        </div>
      )}
    </DashboardShell>
  )
}
