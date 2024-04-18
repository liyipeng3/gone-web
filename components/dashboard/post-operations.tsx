'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/common/icons'
import Modal from '@/components/common/modal'

async function deletePost (postId: string) {
  const response = await fetch(`/api/post/${postId}`, {
    method: 'DELETE'
  })

  if (!response?.ok) {
    toast({
      title: 'Something went wrong.',
      description: 'Your post was not deleted. Please try again.',
      variant: 'destructive'
    })
  }

  return true
}

interface PostOperationsProps {
  post: any
}

export function PostOperations ({ post }: PostOperationsProps) {
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false)
  const [isDeleteLoading, setIsDeleteLoading] = React.useState<boolean>(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <Icons.ellipsis className="h-4 w-4"/>
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href={`/editor/${post.cid}`} className="flex w-full">
              编辑
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator/>
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => {
              setShowDeleteAlert(true)
            }}
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Modal okButtonProps={{ variant: 'destructive' }} title="确认删除文章？" loading={isDeleteLoading}
             visible={showDeleteAlert}
             onVisibleChange={setShowDeleteAlert}
             onOk={async () => {
               setIsDeleteLoading(true)

               const deleted = await deletePost(post.cid)

               if (deleted) {
                 setIsDeleteLoading(false)
                 setShowDeleteAlert(false)
                 router.refresh()
               }
             }}>
        请注意：此操作不可恢复。</Modal>
    </>
  )
}
