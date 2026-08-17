import { getCurrentUser } from '@/lib/session'
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder'
import { DashboardHeader } from '@/components/dashboard/header'
import { PostCreateButton } from '@/components/dashboard/post-create-button'
import { PostItem } from '@/components/dashboard/post-item'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { type Key } from 'react'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Dashboard'
}

export default async function DashboardPage ({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  const page = Number(searchParams.page) || 1
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const totalPosts = await prisma.posts.count({
    where: {
      uid: parseInt(user.id),
      type: 'post',
      status: {
        not: 'deleted'
      }
    }
  })

  const posts: any = await prisma.posts.findMany({
    where: {
      uid: parseInt(user.id),
      type: 'post',
      status: {
        not: 'deleted'
      }
    },
    select: {
      cid: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      status: true
    },
    orderBy: {
      updatedAt: 'desc'
    },
    skip,
    take: pageSize
  })

  // 批量查询草稿，避免逐篇查询（N+1）
  const cids = posts.map((post: { cid: number }) => post.cid)
  if (cids.length > 0) {
    const drafts = await prisma.posts.findMany({
      where: {
        parent: { in: cids },
        type: 'post_draft'
      },
      include: {
        relationships: {
          include: {
            metas: true
          }
        }
      }
    })

    const draftMap = new Map<number, any>()
    drafts.forEach((draft) => {
      // 保留第一条，与原 getDraftPostByCid 的 findFirst 语义一致
      if (draft.parent != null && !draftMap.has(draft.parent)) {
        draftMap.set(draft.parent, draft)
      }
    })

    posts.forEach((post: any) => {
      const draft = draftMap.get(post.cid)
      if (draft) {
        post.draft = draft
      }
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Posts" text="Create and manage posts.">
        <PostCreateButton/>
      </DashboardHeader>
      <div>
        {((posts?.length) !== 0)
          ? (
            <div className="divide-y divide-border rounded-md border">
              {posts.map((post: { cid: Key | null | undefined }) => (
                <PostItem key={post.cid} post={post}/>
              ))}
            </div>
            )
          : (
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="post"/>
              <EmptyPlaceholder.Title>No posts created</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                You don&apos;t have any posts yet. Start creating content.
              </EmptyPlaceholder.Description>
              <PostCreateButton variant="outline"/>
            </EmptyPlaceholder>
            )}
      </div>
      {totalPosts > 0 && (
        <Pagination
          totalItems={totalPosts}
          currentPage={page}
          pageSize={pageSize}
          baseUrl="/dashboard"
        />
      )}
    </DashboardShell>
  )
}
