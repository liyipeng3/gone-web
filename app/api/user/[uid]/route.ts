import { type NextRequest, NextResponse } from 'next/server'
import { type Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireSelf, isAuthResponse } from '@/lib/api-auth'
import { handleApiError, readJson } from '@/lib/api-response'

// 获取用户信息
export async function GET (
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const auth = await requireSelf(params.uid)
    if (isAuthResponse(auth)) return auth

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
    return handleApiError(error, '获取用户信息失败')
  }
}

// 更新用户信息
export async function PATCH (
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const auth = await requireSelf(params.uid)
    if (isAuthResponse(auth)) return auth

    // 获取请求体
    const body = await readJson<Record<string, unknown>>(request)
    if (isAuthResponse(body)) return body

    // 只允许更新特定字段
    const allowedFields = ['url', 'nickname'] as const
    const updateData: Prisma.usersUpdateInput = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field] as string
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
    return handleApiError(error, '更新用户信息失败')
  }
}
