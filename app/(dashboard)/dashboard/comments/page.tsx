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
      <DashboardHeader heading="Comments" text="Manage comments." />
      <div className="overflow-x-auto">
        <div className="mb-4 flex gap-2">
          <div className="flex space-x-2">
            {[
              // { href: '/dashboard/comments?filter=all', label: '全部' },
              { href: '/dashboard/comments?filter=approved', label: '已通过' },
              { href: '/dashboard/comments?filter=waiting', label: '待审核' },
              { href: '/dashboard/comments?filter=spam', label: '垃圾' }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                passHref
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === href.split('=')[1]
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <table className="w-full border-collapse border-solid border-gray-300 dark:border-gray-700">
          <thead className="text-nowrap dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-left">作者</th>
              <th className="px-4 py-2 text-left">内容</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.coid} className="border-t border-gray-300 hover:bg-gray-50 group dark:border-gray-700 dark:hover:bg-gray-800">
                <td className="px-4 py-2"><Checkbox /></td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Image src={getAvatarUrl(comment.email ?? '')} alt={`${comment.author}的头像`} className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
                    <div className="ml-2">
                      <div className="text-sm font-semibold dark:text-gray-200">{comment.author}</div>
                      <a className="text-xs text-blue-600 hover:underline dark:text-blue-400" href={`mailto:${comment.email}`}>{comment.email}</a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{comment.ip}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">

                  <div className="text-sm gap-2 flex flex-col">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dayjs((comment.created ?? 0) * 1000).format('YYYY年MM月DD日')}于 <a target="_blank" href={`/post/${comment.posts?.relationships[0]?.metas?.slug}/${comment.posts?.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">{comment.posts?.title ?? '未知'}</a>
                    </div>
                    <div className="dark:text-gray-200">
                      {comment.text}
                    </div>
                    <CommentActions comment={comment} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalComments > 0 && (
          <Pagination
            totalItems={totalComments}
            currentPage={page}
            pageSize={pageSize}
            baseUrl={`/dashboard/comments?filter=${filter}`}
          />
        )}
      </div>
    </DashboardShell>
  )
}
