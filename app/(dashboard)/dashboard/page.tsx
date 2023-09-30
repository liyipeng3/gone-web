import { getCurrentUser } from '@/lib/session'
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder'
import { DashboardHeader } from '@/components/dashboard/header'
import { PostCreateButton } from '@/components/dashboard/post-create-button'
import { PostItem } from '@/components/dashboard/post-item'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Dashboard'
}

export default async function DashboardPage () {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  const posts = await prisma.posts.findMany({
    where: {
      uid: parseInt(user.id),
      type: 'post'
    },
    select: {
      cid: true,
      title: true,
      created: true
    },
    orderBy: {
      modified: 'desc'
    }
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Posts" text="Create and manage posts.">
        <PostCreateButton/>
      </DashboardHeader>
      <div>
        {((posts?.length) !== 0)
          ? (
            <div className="divide-y divide-border rounded-md border">
              {posts.map((post) => (
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
    </DashboardShell>
  )
}
