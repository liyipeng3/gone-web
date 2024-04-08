'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/common/icons'
import { debounce } from 'lodash-es'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Editor } from '@/components/dashboard/editor'
import dayjs from 'dayjs'
import { InputTag } from '@/components/ui/input-tag'

interface EditorProps {
  params: { cid: string }
}

const saveDraft = debounce(async ({
  cid,
  post
}: { cid: string, post: any }) => {
  return await fetch(`/api/post/${cid}/draft`, {
    method: 'post',
    body: JSON.stringify(post)
  }).then(async res => await res.json())
})

const EditorPage: React.FC<EditorProps> = ({ params }) => {
  const isInitialRef = React.useRef(false)
  const [post, setPost] = useState<any>({})
  const [draft, setDraft] = useState<any>({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ name: string, slug: string, description: string }>>([])

  useEffect(() => {
    void (async () => {
      const res: any = await fetch(`/api/post/${params.cid}`).then(async res => await res.json())
      setPost(res)
      if (res.draft) {
        setDraft(res.draft)
      } else {
        setDraft(res)
      }
    })()

    void fetch('/api/category').then(async res => await res.json()).then(res => {
      setCategories(res)
    })
  }, [params.cid])

  useEffect(() => {
    if (!draft.slug) {
      return
    }
    if (!isInitialRef.current) {
      isInitialRef.current = true
      return
    }
    console.log(draft.title, draft.slug, draft.category, params.cid)
    void (async () => {
      setSaveLoading(true)
      await saveDraft({
        cid: params.cid,
        post: draft
      })
      setSaveLoading(false)
    })()
  }, [draft.text, draft.title, draft.slug, params.cid])

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
            {post.draft || post.status !== 'publish' ? '草稿' : '已发布'}
          </p>

          <p className="text-sm text-muted-foreground">
            {saveLoading ? '保存中' : `保存于 ${dayjs(draft.modified * 1000).format('YY.MM.DD HH:mm')}`}
          </p>

        </div>
        <div className="flex gap-5">
          <div>
            <Select value={draft.category}>
              <SelectTrigger>
                <SelectValue placeholder="Category"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map(category => {
                    return <SelectItem className="cursor-pointer" key={category.slug}
                                       value={category.slug}>{category.name}</SelectItem>
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <button type="submit" className={cn(buttonVariants({ variant: 'secondary' }))}>
            {false && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            <span>删除草稿</span>
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
          value={draft?.title}
          onChange={(e) => {
            const title = e.target.value
            setDraft({
              ...draft,
              title
            })
            translateTitle({
              title
            })
          }}
        />
        <Input placeholder="Slug" value={draft?.slug?.replace('@', '')} onChange={(e) => {
          setDraft({
            ...draft,
            slug: e.target.value
          })
        }}/>
        <InputTag placeholder="请输入标签" value={post?.tags} onChange={(value) => {
          setDraft({
            ...draft,
            tags: value
          })
        }}/>
        {/* <Input placeholder="请输入标签" value={post.tags?.join(',')} onChange={(e) => { */}
        {/*   setPost({ */}
        {/*     ...post, */}
        {/*     tags: e.target.value.split(',') */}
        {/*   }) */}
        {/* }}/> */}
      </div>
      <div className="flex min-w-full w-full flex-1 py-4 gap-4">
        {/* <div className="w-1/2"> */}
        {/* <Textarea className="w-full h-full resize-none p-2 focus:outline-0 min-h-[25rem]" */}
        {/*           value={post.text} */}
        {/*           onChange={(e) => { */}
        {/*             setPost({ ...post, text: e.target.value }) */}
        {/*           }}/> */}

        <Editor className="w-full min-w-full h-full resize-none p-2 focus:outline-0 min-h-[25rem]" value={draft.text}
                onChange={(value) => {
                  setDraft({
                    ...draft,
                    text: value
                  })
                }}/>
        {/* </div> */}
        {/* <div */}
        {/*   className="w-1/2 text-left p-2 outline-none rounded-md border border-input"> */}
        {/*   <Prose content={marked.parse(post.text || '') as string}/> */}
        {/* </div> */}
      </div>
    </div>
  )
}

export default EditorPage
