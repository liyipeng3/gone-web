'use client'
import React, { useEffect, useState } from 'react'
import marked from '@/lib/marked'
import Prose from '@/components/common/prose'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/common/icons'
import { Textarea } from '@/components/ui/textarea'

interface EditorProps {
  params: Record<string, string>
}

const Editor: React.FC<EditorProps> = ({ params }) => {
  const [content, setContent] = useState('')
  const [post, setPost] = useState<any>()

  console.log(params.cid)

  useEffect(() => {
    void fetch(`/api/post/${params.cid}`).then(async res => await res.json()).then(res => {
      console.log(res)
      setPost(res)
    })
  }, [])

  return (
    <div className="px-10 h-full">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            <>
              <Icons.chevronLeft className="mr-2 h-4 w-4"/>
              Back
            </>
          </Link>
          <p className="text-sm text-muted-foreground">
            {content ? 'Published' : 'Draft'}
          </p>
        </div>
        <button type="submit" className={cn(buttonVariants())}>
          {false && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
          )}
          <span>Save</span>
        </button>
      </div>
      <div className="py-4 gap-3 flex flex-col">
        <Input
          id="title"
          placeholder="标题"
          value={post?.title}
        />
        <Input placeholder="Slug" value={post?.slug}/>
      </div>
      <div className="flex w-full flex-1 py-4 gap-4">
        <div className="w-1/2">
          <Textarea className="w-full h-full resize-none p-2 focus:outline-0 min-h-[25rem]"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value)
                    }}/>
        </div>
        <div
          className="w-1/2 text-left p-2 outline-none ring-2 ring-ring ring-offset-2 rounded-md border border-input">
          <Prose content={marked.parse(content) as string}/>
        </div>
      </div>
    </div>
  )
}

export default Editor
