'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function ProfilePage () {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    url: '',
    screenName: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/user/${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setUserData({
              username: data.username || '',
              email: data.mail || '',
              url: data.url || '',
              screenName: data.screenName || ''
            })
          }
        } catch (error) {
          console.error('获取用户数据失败', error)
          toast({
            title: '获取用户数据失败',
            description: '请稍后再试',
            variant: 'destructive'
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (session?.user) {
      void fetchUserData()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/user/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: userData.url,
          screenName: userData.screenName
        })
      })

      if (response.ok) {
        toast({
          title: '个人信息已更新',
          description: '您的个人信息已成功更新',
          variant: 'default'
        })
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新用户数据失败', error)
      toast({
        title: '更新失败',
        description: '更新个人信息时发生错误，请稍后再试',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>
            在这里管理您的个人信息
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                value={userData.username}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">用户名不可修改</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                value={userData.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">邮箱不可修改</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenName">昵称</Label>
              <Input
                id="screenName"
                name="screenName"
                value={userData.screenName}
                onChange={handleInputChange}
                placeholder="请输入您的昵称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">个人网站</Label>
              <Input
                id="url"
                name="url"
                value={userData.url}
                onChange={handleInputChange}
                placeholder="请输入您的个人网站地址"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
                  )
                : (
                    '保存更改'
                  )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
