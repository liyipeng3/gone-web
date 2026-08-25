'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { type ButtonProps, buttonVariants } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/common/icons'
import http from '@/lib/http'

interface PostCreateButtonProps extends ButtonProps {
}

export function PostCreateButton ({
  className,
  variant,
  ...props
}: PostCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onClick () {
    setIsLoading(true)

    try {
      const post = await http.post<{ cid: number }>('/api/post/create')

      // This forces a cache invalidation.
      router.refresh()

      router.push(`/editor/${post.cid}`)
    } catch (error) {
      console.error('创建文章失败:', error)
      toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        buttonVariants({ variant }),
        {
          'cursor-not-allowed opacity-60': isLoading
        },
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading
        ? (
          <Icons.spinner className="h-4 w-4 animate-spin"/>
          )
        : (
          <Icons.add className="h-4 w-4"/>
          )}
      新建
    </button>
  )
}
