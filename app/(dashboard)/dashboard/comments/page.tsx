import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'
import CommentsTable from '@/components/dashboard/comments-table'

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

  const [totalComments, statusCounts, comments] = await Promise.all([
    prisma.comments.count({
      where: whereCondition
    }),
    // 各状态的真实总数，独立于当前筛选与分页
    prisma.comments.groupBy({
      by: ['status'],
      _count: true
    }),
    prisma.comments.findMany({
      where: whereCondition,
      select: {
        coid: true,
        cid: true,
        createdAt: true,
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
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    })
  ])

  // 各状态总数映射，供筛选 Tab 展示真实数量
  const countByStatus = statusCounts.reduce<Record<string, number>>((acc, cur) => {
    if (cur.status) acc[cur.status] = cur._count
    return acc
  }, {})

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
            const statusCount = countByStatus[status] ?? 0

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
      <CommentsTable key={`${filter}-${page}`} comments={comments} filter={filter} page={page} />

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
