import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { PostOperations } from '@/components/dashboard/post-operations'
import dayjs from 'dayjs'

interface PostItemProps {
  post: any
}

export function PostItem ({ post }: PostItemProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="grid gap-1">
        <Link
          href={`/editor/${post.cid}`}
          className="font-semibold hover:underline"
        >
          {post.title ? post.title : post?.draft?.title ? `${post?.draft?.title} (草稿)` : 'Untitled'}
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">
            {dayjs((post.created || post.draft.created) * 1000).format('YYYY年MM月DD日 HH:mm')}
          </p>
        </div>
      </div>
      <PostOperations post={post}/>
    </div>
  )
}

PostItem.Skeleton = function PostItemSkeleton () {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5"/>
        <Skeleton className="h-4 w-4/5"/>
      </div>
    </div>
  )
}
