'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useAutoSaveDraft } from '@/hooks/use-auto-save-draft'
import { type DraftSnapshotContent } from '@/lib/draft-snapshot'

interface EditorProps {
  params: { cid: string }
}

interface Category {
  name: string
  slug: string
  description: string
}

// 从编辑态中提取可保存/可快照的内容字段
const buildContent = (draft: any): DraftSnapshotContent => ({
  title: draft?.title ?? null,
  slug: draft?.slug,
  text: draft?.text ?? null,
  category: draft?.category ?? null,
  tags: draft?.tags ?? []
})

const EditorPage: React.FC<EditorProps> = ({ params }) => {
  const [post, setPost] = useState<any>({})
  const [draft, setDraft] = useState<any>({})
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const content = useMemo(() => buildContent(draft), [draft])
  const enabled = Boolean(draft.slug)

  const onDraftCreated = useCallback((newCid: number) => {
    setDraft((d: any) => (d.cid === newCid ? d : { ...d, cid: newCid }))
    setPost((p: any) => (p?.draft?.cid === newCid
      ? p
      : { ...p, draft: { ...(p?.draft ?? {}), cid: newCid } }))
  }, [])

  const {
    status: saveStatus,
    lastSavedAt,
    retry,
    initSavedAt,
    resetInitial,
    clearSnapshot,
    recoverySnapshot,
    detectRecovery,
    applyRecovery,
    discardRecovery
  } = useAutoSaveDraft({
    cid: params.cid,
    content,
    enabled,
    onDraftCreated
  })

  const getData = useCallback(async () => {
    const res: any = await http.get(`/api/post/${params.cid}`)
    setPost(res)
    const editable = res.draft?.cid
      ? { ...res.draft, slug: res.draft.slug.slice(1) }
      : res
    setDraft(editable)
    initSavedAt(editable.updatedAt ? new Date(editable.updatedAt) : null)
    return {
      content: buildContent(editable),
      updatedAt: editable.updatedAt ? new Date(editable.updatedAt).getTime() : 0
    }
  }, [params.cid, initSavedAt])

  const {
    run: deleteDraft,
    loading: deleteDraftLoading
  } = useRequest(async () => {
    if (post.cid !== draft.cid) {
      await fetch(`/api/post/${post.cid}/draft`, {
        method: 'delete'
      }).then(async res => await res.json())
      clearSnapshot()
      await getData()
      resetInitial()
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
    clearSnapshot()
    await getData()
    resetInitial()
    toast({
      title: '发布成功',
      variant: 'success'
    })
  }, {
    manual: true
  })

  // 初始化：加载文章与分类，并检测本地是否存在更新的未保存快照
  useEffect(() => {
    void (async () => {
      const server = await getData()

      void http.get('/api/category').then(res => {
        setCategories(res as Category[])
      })

      detectRecovery(server)
    })()
  }, [params.cid])

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

  const onApplyRecovery = useCallback(() => {
    const recovered = applyRecovery()
    if (!recovered) return
    setDraft((d: any) => ({
      ...d,
      title: recovered.title,
      slug: recovered.slug,
      text: recovered.text,
      category: recovered.category,
      tags: recovered.tags ?? []
    }))
  }, [applyRecovery])

  // 保存状态文案
  const renderSaveStatus = (): React.ReactNode => {
    if (saveStatus === 'saving') {
      return <span className="text-sm text-muted-foreground">保存中…</span>
    }
    if (saveStatus === 'error') {
      return (
        <button
          type="button"
          onClick={retry}
          className="text-sm text-destructive underline underline-offset-2"
        >
          保存失败，点击重试
        </button>
      )
    }
    if (lastSavedAt) {
      return (
        <span className="text-sm text-muted-foreground">
          保存于 {dayjs(lastSavedAt).format('YY.M.DD HH:mm')}
        </span>
      )
    }
    return null
  }

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
          {renderSaveStatus()}
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
      <Modal
        title="检测到未保存内容"
        visible={recoverySnapshot !== null}
        onVisibleChange={(visible) => {
          if (!visible) discardRecovery()
        }}
        onCancel={discardRecovery}
        onOk={onApplyRecovery}
      >
        本地存在一份比服务端更新的未保存内容，是否恢复？选择“取消”将丢弃本地内容。
      </Modal>
    </div>
  )
}

export default EditorPage
