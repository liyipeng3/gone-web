'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  writeDraftSnapshot,
  readDraftSnapshot,
  clearDraftSnapshot,
  draftContentDiffers,
  type DraftSnapshot,
  type DraftSnapshotContent
} from '@/lib/draft-snapshot'

interface EditorProps {
  params: { cid: string }
}

interface Category {
  name: string
  slug: string
  description: string
}

// 草稿保存接口返回的精简结构
interface SaveDraftResponse {
  cid: number
  slug: string
  title: string | null
  updatedAt: string | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// 从编辑态中提取可保存/可快照的内容字段
const buildContent = (draft: any): DraftSnapshotContent => ({
  title: draft?.title ?? null,
  slug: draft?.slug,
  text: draft?.text ?? null,
  category: draft?.category ?? null,
  tags: draft?.tags ?? []
})

const EditorPage: React.FC<EditorProps> = ({ params }) => {
  const isInitialRef = useRef(false)
  // 始终持有最新编辑态与“存在未保存改动”标记，供卸载/关闭页时的 flush 使用
  const draftRef = useRef<any>({})
  const pendingRef = useRef(false)

  const [post, setPost] = useState<any>({})
  const [draft, setDraft] = useState<any>({})
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [recoverySnapshot, setRecoverySnapshot] = useState<DraftSnapshot | null>(null)

  const getData = useCallback(async () => {
    const res: any = await http.get(`/api/post/${params.cid}`)
    setPost(res)
    const editable = res.draft?.cid
      ? { ...res.draft, slug: res.draft.slug.slice(1) }
      : res
    setDraft(editable)
    setLastSavedAt(editable.updatedAt ? new Date(editable.updatedAt) : null)
    return {
      content: buildContent(editable),
      updatedAt: editable.updatedAt ? new Date(editable.updatedAt).getTime() : 0
    }
  }, [params.cid])

  const {
    run: saveDraft,
    loading: saveLoading
  } = useRequest(async ({
    cid,
    post
  }: { cid: string, post: DraftSnapshotContent }) => {
    return await http.post<SaveDraftResponse>(`/api/post/${cid}/draft`, post)
  }, {
    manual: true,
    // 防抖 1.5s，同时以 maxWait 5s 兜底：持续输入时也能定期落盘
    debounceWait: 1500,
    debounceMaxWait: 5000,
    onSuccess: (res) => {
      pendingRef.current = false
      setSaveStatus('saved')
      setLastSavedAt(res?.updatedAt ? new Date(res.updatedAt) : new Date())
      // 保存成功后清除本地快照
      clearDraftSnapshot(params.cid)
      // 若本次保存刚创建了独立草稿，仅在本地补齐草稿标识，
      // 不整体覆盖编辑态内容（避免竞态丢字）。
      if (res?.cid) {
        setDraft((d: any) => (d.cid === res.cid ? d : { ...d, cid: res.cid }))
        setPost((p: any) => (p?.draft?.cid === res.cid
          ? p
          : { ...p, draft: { ...(p?.draft ?? {}), cid: res.cid } }))
      }
    },
    onError: (e) => {
      setSaveStatus('error')
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
      clearDraftSnapshot(params.cid)
      pendingRef.current = false
      setSaveStatus('idle')
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
    clearDraftSnapshot(params.cid)
    pendingRef.current = false
    setSaveStatus('idle')
    await getData()
    isInitialRef.current = false
    toast({
      title: '发布成功',
      variant: 'success'
    })
  }, {
    manual: true
  })

  // 保持 draftRef 与最新编辑态同步，供 flush 读取
  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  // 页面关闭 / 切走时，尽力补发最后一次未保存内容（防丢）
  useEffect(() => {
    const flush = (): void => {
      if (!pendingRef.current) return
      const d = draftRef.current
      if (!d?.slug) return
      try {
        const payload = JSON.stringify(buildContent(d))
        navigator.sendBeacon(
          `/api/post/${params.cid}/draft`,
          new Blob([payload], { type: 'application/json' })
        )
      } catch {
        // 尽力而为，忽略异常
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      // 组件卸载（如切换文章 / 离开编辑页）时同样 flush
      flush()
    }
  }, [params.cid])

  // 初始化：加载文章与分类，并检测本地是否存在更新的未保存快照
  useEffect(() => {
    void (async () => {
      const server = await getData()

      void http.get('/api/category').then(res => {
        setCategories(res as Category[])
      })

      const snapshot = readDraftSnapshot(params.cid)
      if (
        snapshot &&
        snapshot.savedAt > server.updatedAt &&
        draftContentDiffers(snapshot, server.content)
      ) {
        setRecoverySnapshot(snapshot)
      }
    })()
  }, [params.cid])

  // 内容变更：写本地快照 + 触发防抖保存
  useEffect(() => {
    if (!draft.slug) {
      return
    }
    if (!isInitialRef.current) {
      isInitialRef.current = true
      return
    }

    const content = buildContent(draft)
    // 立即写快照（不防抖），保证崩溃时也能恢复到最新一次输入
    writeDraftSnapshot(params.cid, content)
    pendingRef.current = true
    setSaveStatus('saving')
    saveDraft({
      cid: params.cid,
      post: content
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

  const retrySave = useCallback(() => {
    if (!draft.slug) return
    setSaveStatus('saving')
    saveDraft({ cid: params.cid, post: buildContent(draft) })
  }, [draft, params.cid, saveDraft])

  const applyRecovery = useCallback(() => {
    if (!recoverySnapshot) return
    setDraft((d: any) => ({
      ...d,
      title: recoverySnapshot.title,
      slug: recoverySnapshot.slug,
      text: recoverySnapshot.text,
      category: recoverySnapshot.category,
      tags: recoverySnapshot.tags ?? []
    }))
    setRecoverySnapshot(null)
  }, [recoverySnapshot])

  const discardRecovery = useCallback(() => {
    clearDraftSnapshot(params.cid)
    setRecoverySnapshot(null)
  }, [params.cid])

  // 保存状态文案
  const renderSaveStatus = (): React.ReactNode => {
    if (saveLoading || saveStatus === 'saving') {
      return <span className="text-sm text-muted-foreground">保存中…</span>
    }
    if (saveStatus === 'error') {
      return (
        <button
          type="button"
          onClick={retrySave}
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
        onOk={applyRecovery}
      >
        本地存在一份比服务端更新的未保存内容，是否恢复？选择“取消”将丢弃本地内容。
      </Modal>
    </div>
  )
}

export default EditorPage
