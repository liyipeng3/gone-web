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
          {post.title
            ? post.title
            : post?.draft?.title
              ? post?.draft?.title
              : 'Untitled'}
          <span
            className="text-gray-500 text-xs">
            {
              post?.status !== 'publish'
                ? `（未发布:${dayjs((post.draft?.modified || post.draft.created) * 1000).format('YYYY-M-D HH:mm')}）`
                : post.draft?.cid
                  ? `（草稿:${dayjs((post.draft?.modified || post.draft.created) * 1000).format('YYYY-M-D HH:mm')}）`
                  : null
            }
          </span>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground grid grid-cols-2">
           <span>Create: {dayjs((post.created || post.draft.created) * 1000).format('YYYY年M月D日 HH:mm')}</span>
           <span>Update: {dayjs((post?.modified || post.draft?.modified) * 1000).format('YYYY年M月D日 HH:mm')}</span>
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
