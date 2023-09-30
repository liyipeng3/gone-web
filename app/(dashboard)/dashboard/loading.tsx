import { DashboardHeader } from '@/components/dashboard/header'
import { PostCreateButton } from '@/components/dashboard/post-create-button'
import { PostItem } from '@/components/dashboard/post-item'
import { DashboardShell } from '@/components/dashboard/shell'

export default function DashboardLoading () {
  return (
    <DashboardShell>
      <DashboardHeader heading="Posts" text="Create and manage posts.">
        <PostCreateButton/>
      </DashboardHeader>
      <div className="divide-border-200 divide-y rounded-md border">
        <PostItem.Skeleton/>
        <PostItem.Skeleton/>
        <PostItem.Skeleton/>
        <PostItem.Skeleton/>
        <PostItem.Skeleton/>
      </div>
    </DashboardShell>
  )
}
