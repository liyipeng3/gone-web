'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function Profile ({ user }: { user?: {
  uid: number
  username: string | null
  email: string | null
  url: string | null
  nickname: string | null
} | null }) {
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState(user ?? {
    uid: 0,
    username: '',
    email: '',
    url: '',
    nickname: ''
  })

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
      const response = await fetch(`/api/user/${user?.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: userData.url,
          username: userData.username
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

  return (
    <div className="grid gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Manage your personal information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                value={userData.username ?? ''}
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
                value={userData.email ?? ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">邮箱不可修改</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                name="nickname"
                value={userData.nickname ?? ''}
                onChange={handleInputChange}
                placeholder="请输入您的昵称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">个人网站</Label>
              <Input
                id="url"
                name="url"
                value={userData.url ?? ''}
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
