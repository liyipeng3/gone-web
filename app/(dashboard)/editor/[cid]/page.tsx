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
import { useRequest } from 'ahooks'
import Modal from '@/components/common/modal'
import { toast } from '@/components/ui/use-toast'
import http from '@/lib/http'

interface EditorProps {
  params: { cid: string }
}

interface Category {
  name: string
  slug: string
  description: string
}

const EditorPage: React.FC<EditorProps> = ({ params }) => {
  const isInitialRef = React.useRef(false)
  const [post, setPost] = useState<any>({})
  const [draft, setDraft] = useState<any>({})
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const getData = useCallback(async () => {
    const res: any = await http.get(`/api/post/${params.cid}`)
    setPost(res)
    if (res.draft?.cid) {
      setDraft({
        ...res.draft,
        slug: res.draft.slug.slice(1)
      })
    } else {
      setDraft(res)
    }
  }, [params.cid])

  const {
    run: saveDraft,
    loading: saveLoading
  } = useRequest(async ({
    cid,
    post
  }: { cid: string, post: any }) => {
    await http.post(`/api/post/${cid}/draft`, post)
    await getData()
  }, {
    manual: true,
    debounceWait: 3 * 1000,
    onError: (e) => {
      toast({
        title: '保存失败',
        variant: 'destructive',
        description: e.message
      })
    }
  })

  const {
    run: deleteDraft,
    loading: deleteDraftLoading
  } = useRequest(async () => {
    if (post.cid !== draft.cid) {
      await fetch(`/api/post/${post.cid}/draft`, {
        method: 'delete'
      }).then(async res => await res.json())
      await getData()
      isInitialRef.current = false
    }
  }, {
    manual: true
  })

  const {
    run: publish,
    loading: publishLoading
  } = useRequest(async () => {
    if (!draft.category) {
      toast({
        title: '请选择分类',
        variant: 'destructive'

      })
      return
    }
    await http.post(`/api/post/${post.cid}/publish`)
    await getData()
    isInitialRef.current = false
    toast({
      title: '发布成功',
      variant: 'success'
    })
  }, {
    manual: true
  })

  useEffect(() => {
    void getData()

    void http.get('/api/category').then(res => {
      setCategories(res as Category[])
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

    saveDraft({
      cid: params.cid,
      post: draft
    })
  }, [draft.text, draft.title, draft.slug, draft.category, JSON.stringify(draft.tags), params.cid])

  const translateTitle = useCallback(debounce(({ title }) => {
    void fetch(`/api/utils/translate?q=${title}`).then(async res => await res.json()).then(res => {
      if (res) {
        setDraft((post: any) => ({
          ...post,
          slug: res?.text.replaceAll(' ', '-').toLowerCase()
        }))
      }
    })
  }, 1000), [])

  return (
    <div className="px-10 h-full">
      <div className="flex w-full items-center justify-between pt-1">
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
            {(post?.draft?.cid || post.status !== 'publish') ? '草稿' : '已发布'}
          </p>
          {
            draft.updatedAt
              ? <p className="text-sm text-muted-foreground">
                                  {saveLoading ? '保存中' : `保存于 ${dayjs(draft.updatedAt).format('YY.M.DD HH:mm')}`}
              </p>
              : null
          }
        </div>
        <div className="flex gap-5">
          <div>
            <Select value={draft.category} onValueChange={(value) => {
              setDraft((post: any) => ({
                ...post,
                category: value
              }))
            }}>
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
          {
            post.cid !== draft.cid && <button type="submit" onClick={() => {
              setConfirmModalVisible(true)
            }} className={cn(buttonVariants({ variant: 'secondary' }))}>
              {deleteDraftLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
              )}
              <span>删除草稿</span>
            </button>
          }

          {
            (post?.draft?.cid || post.status !== 'publish')
              ? <button type="submit" className={cn(buttonVariants())}
                        onClick={() => {
                          publish()
                        }}
              >
                {publishLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
                )}
                <span>发布</span>
              </button>
              : null
          }

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
        <Input placeholder="Slug" value={draft.slug} onChange={(e) => {
          console.log(e.target.value)
          setDraft({
            ...draft,
            slug: e.target.value
          })
        }}/>
        <InputTag placeholder="请输入标签" value={draft?.tags || []} onChange={(value) => {
          setDraft({
            ...draft,
            tags: value
          })
        }}/>
      </div>
      <div className="flex min-w-full w-full flex-1 py-4 gap-4">
        <Editor className="w-full min-w-full h-full focus:outline-0 min-h-[25rem]" value={draft.text}
                onChange={(value) => {
                  setDraft((draft: any) => ({
                    ...draft,
                    text: value
                  }))
                }}/>
      </div>
      <Modal okButtonProps={{ variant: 'destructive' }} visible={confirmModalVisible}
             onVisibleChange={setConfirmModalVisible}
             onOk={() => {
               deleteDraft()
             }}>
        确认删除草稿？
      </Modal>
    </div>
  )
}

export default EditorPage
