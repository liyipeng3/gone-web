import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import prisma from '@/lib/prisma'

/**
 * API 鉴权辅助工具
 *
 * 用法：
 *   const auth = await requireUser()
 *   if (isAuthResponse(auth)) return auth
 *   // 此处 auth 为已登录用户
 */

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

export const isAdministrator = async (user: SessionUser): Promise<boolean> => {
  const uid = Number(user.id)
  if (!Number.isInteger(uid) || uid <= 0) {
    return false
  }

  const userRecord = await prisma.users.findUnique({
    where: { uid },
    select: {
      group: true
    }
  })

  return userRecord?.group === 'administrator'
}

/**
 * 要求已登录。未登录返回 401 响应，否则返回当前用户。
 */
export const requireUser = async (): Promise<SessionUser | NextResponse> => {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 })
  }

  return user
}

/**
 * 要求管理员权限。未登录返回 401，非管理员返回 403，否则返回当前用户。
 */
export const requireAdmin = async (): Promise<SessionUser | NextResponse> => {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 })
  }

  const uid = Number(user.id)
  if (!Number.isInteger(uid) || uid <= 0) {
    return NextResponse.json({ error: '用户信息不完整' }, { status: 400 })
  }

  if (!(await isAdministrator(user))) {
    return NextResponse.json({ error: '权限不足，需要管理员权限' }, { status: 403 })
  }

  return user
}

/**
 * 判断鉴权结果是否为需要提前返回的响应（401/403 等）。
 */
export const isAuthResponse = (value: unknown): value is NextResponse => {
  return value instanceof NextResponse
}
