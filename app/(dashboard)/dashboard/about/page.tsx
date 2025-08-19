'use client'
import React, { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Editor } from '@/components/dashboard/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import http from '@/lib/http'
import { useRequest } from 'ahooks'
import { Icons } from '@/components/common/icons'

interface Post {
  cid: number
  title: string
  text: string
  slug: string
  category?: string
  tags?: string[]
  [key: string]: any
}

export default function AboutPage () {
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const fetchAboutPage = async () => {
    try {
      const response = await http.get('/api/post/about')
      if (response) {
        setPost(response as Post)
        setTitle((response as Post).title ?? '')
        setContent((response as Post).text ?? '')
      }
    } catch (error) {
      toast({
        title: '获取 About 页面失败',
        variant: 'destructive',
        description: (error as Error).message
      })
    }
  }

  const { run: saveAboutPage, loading: saveLoading } = useRequest(
    async () => {
      if (!title.trim()) {
        toast({
          title: '标题不能为空',
          variant: 'destructive'
        })
        return
      }

      if (!post?.cid) {
        toast({
          title: '未找到 About 页面',
          variant: 'destructive'
        })
        return
      }

      try {
        await http.post(`/api/post/${post.cid}/save`, {
          title,
          text: content,
          type: 'page',
          status: 'publish',
          slug: 'about',
          category: post.category ?? 'default',
          tags: post.tags ?? []
        })
        await http.get('/api/post/about?forceRefresh=true')
        await fetchAboutPage()

        toast({
          title: '保存成功',
          variant: 'success'
        })
      } catch (error) {
        toast({
          title: '保存失败',
          variant: 'destructive',
          description: (error as Error).message
        })
      }
    },
    { manual: true }
  )

  useEffect(() => {
    void fetchAboutPage()
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="About"
        text="Edit the about page content"
      />

      <div className="grid gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            标题
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => { setTitle(e.target.value) }}
            placeholder="请输入标题"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            内容
          </label>
          <Editor
            className="min-h-[400px]"
            value={content}
            onChange={(value) => { setContent(value ?? '') }}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => { saveAboutPage() }}>
            {saveLoading && (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            )}
            保存更改
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
