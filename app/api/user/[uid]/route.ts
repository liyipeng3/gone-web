import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// 获取用户信息
export async function GET (
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    // 验证用户是否登录
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 验证用户是否有权限访问此信息（只能访问自己的信息）
    if (String(currentUser.id) !== params.uid) {
      return NextResponse.json(
        { error: '无权访问此用户信息' },
        { status: 403 }
      )
    }

    // 查询用户信息
    const user = await prisma.users.findUnique({
      where: {
        uid: parseInt(params.uid)
      },
      select: {
        uid: true,
        username: true,
        email: true,
        url: true,
        nickname: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PATCH (
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    // 验证用户是否登录
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 验证用户是否有权限更新此信息（只能更新自己的信息）
    if (currentUser.id !== params.uid) {
      return NextResponse.json(
        { error: '无权更新此用户信息' },
        { status: 403 }
      )
    }

    // 获取请求体
    const body = await request.json()

    // 只允许更新特定字段
    const allowedFields = ['url', 'nickname']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.users.update({
      where: {
        uid: parseInt(params.uid)
      },
      data: updateData,
      select: {
        uid: true,
        username: true,
        email: true,
        url: true,
        nickname: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    )
  }
}
