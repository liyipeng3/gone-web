'use client'
import React, { useCallback, useEffect, useState } from 'react'
import marked from '@/lib/marked'
import Prose from '@/components/common/prose'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/common/icons'
import { Textarea } from '@/components/ui/textarea'
import { debounce } from 'lodash-es'

interface EditorProps {
  params: { cid: string }
}

const saveDraft = debounce(async ({ cid, post }: { cid: string, post: any }) => {
  return await fetch(`/api/post/${cid}/draft`, { method: 'post', body: JSON.stringify(post) }).then(async res => await res.json())
})

const Editor: React.FC<EditorProps> = ({ params }) => {
  const [post, setPost] = useState<any>({})
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    void fetch(`/api/post/${params.cid}`).then(async res => await res.json()).then(res => {
      if (res.draft) {
        setPost({ draft: true, ...res.draft })
      } else {
        setPost(res)
      }
    })
  }, [])

  useEffect(() => {
    void (async () => {
      if (!post.slug) {
        return
      }
      setSaveLoading(true)
      await saveDraft({ cid: params.cid, post })
      setSaveLoading(false)
    })()
  }, [post])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translateTitle = useCallback(debounce(({ title }) => {
    void fetch(`/api/utils/translate?q=${title}`).then(async res => await res.json()).then(res => {
      if (res) {
        setPost((post: any) => ({
          ...post,
          slug: res?.text.replaceAll(' ', '-').toLowerCase()
        }))
      }
    })
  }, 1000), [])

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
            {post.draft ? 'Draft' : 'Published'}
          </p>
          <p className="text-sm text-muted-foreground">
            {saveLoading ? 'Saving' : 'Saved'}
          </p>
        </div>
        <div className="flex gap-5">
          <button type="submit" className={cn(buttonVariants({ variant: 'secondary' }))}>
            {false && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            <span>Reset</span>
          </button>
          <button type="submit" className={cn(buttonVariants())}>
            {false && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            <span>发布</span>
          </button>
        </div>
      </div>
      <div className="py-4 gap-3 flex flex-col">
        <Input
          id="title"
          placeholder="标题"
          value={post?.title}
          onChange={(e) => {
            const title = e.target.value

            setPost({
              ...post,
              title
            })
            translateTitle({ title, post })
          }}
        />
        <Input placeholder="Slug" value={post?.slug} onChange={(e) => {
          setPost({
            ...post,
            slug: e.target.value
          })
        }}/>
      </div>
      <div className="flex w-full flex-1 py-4 gap-4">
        <div className="w-1/2">
          <Textarea className="w-full h-full resize-none p-2 focus:outline-0 min-h-[25rem]"
                    value={post.text}
                    onChange={(e) => {
                      setPost({ ...post, text: e.target.value })
                    }}/>
        </div>
        <div
          className="w-1/2 text-left p-2 outline-none rounded-md border border-input">
          <Prose content={marked.parse(post.text || '') as string}/>
        </div>
      </div>
    </div>
  )
}

export default Editor
