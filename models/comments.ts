import prisma from '@/lib/prisma'
import { cache } from 'react'
import { type Prisma } from '@prisma/client'
import { cacheService, cacheKeys } from '@/lib/cache'

// 评论创建入参：调用方提供的字段，cid/parent 由 createComment 补全；
// status 可选——公开评论按邮箱规则自动判定，管理员回复可显式传入 'approved'
export type CreateCommentData = Pick<
Prisma.commentsUncheckedCreateInput,
'author' | 'text' | 'url' | 'agent' | 'ip'
> & { email: string, status?: string }

// 使用 React.cache 在同一请求内去重（文章页与 CommentList 会各调用一次）
export const getCommentsByCid = cache(async (cid: number) => {
  return await prisma.comments.findMany({
    where: { cid, status: 'approved' }
  })
})

export const getCommentById = async (coid: number) => {
  return await prisma.comments.findUnique({
    where: { coid }
  })
}

export const createComment = async (cid: number, parent: number = 0, data: CreateCommentData) => {
  const { status: statusOverride, ...commentData } = data
  const email = data.email
  let status = statusOverride ?? 'waiting'
  // 未显式指定状态时，同一邮箱只需审核一次
  if (!statusOverride) {
    const beforeComment = await prisma.comments.findFirst({
      where: { email, status: 'approved' }
    })
    if (beforeComment) {
      status = 'approved'
    }
  }

  const result = await prisma.comments.create({
    data: {
      ...commentData,
      cid,
      parent,
      status
    }
  })

  // 清除评论相关的缓存
  cacheService.delByPrefix(cacheKeys.recentComments)

  return result
}

export const getComments = async () => {
  return await prisma.comments.findMany()
}

export const deleteComment = async (coid: number) => {
  // 清除评论相关的缓存
  cacheService.delByPrefix(cacheKeys.recentComments)

  return await prisma.comments.delete({
    where: { coid }
  })
}

export const updateComment = async (coid: number, data: Prisma.commentsUpdateInput) => {
  // 清除评论相关的缓存
  cacheService.delByPrefix(cacheKeys.recentComments)

  return await prisma.comments.update({
    where: { coid },
    data
  })
}

// 批量更新评论状态（后台批量审核/标记）。updateMany 为单条 SQL，原子且高效；
// 批量操作不逐条触发审核通过邮件通知，属于刻意取舍。
export const batchUpdateCommentStatus = async (coids: number[], status: string) => {
  const result = await prisma.comments.updateMany({
    where: { coid: { in: coids } },
    data: { status }
  })

  // 清除评论相关的缓存
  cacheService.delByPrefix(cacheKeys.recentComments)

  return result
}

export const getRecentComments = async (limit: number = 10) => {
  // 使用缓存键
  const cacheKey = `${cacheKeys.recentComments}:${limit}`
  const cachedData = cacheService.get(cacheKey)

  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData
  }

  // 使用 Promise.all 并行获取数据
  const comments = await prisma.comments.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      posts: {
        select: {
          title: true,
          slug: true,
          cid: true
        }
      }
    }
  })

  // 如果没有评论，直接返回空数组
  if (comments.length === 0) {
    cacheService.set(cacheKey, [])
    return []
  }

  // 获取所有评论关联的文章的 cid，过滤掉 undefined 值并确保类型正确
  const postCids = comments
    .map(comment => comment.posts?.cid)
    .filter((cid): cid is number => cid !== undefined && cid !== null)

  // 如果没有有效的 cid，直接返回原始评论
  if (postCids.length === 0) {
    cacheService.set(cacheKey, comments)
    return comments
  }

  // 获取文章对应的分类
  const categoriesData = await prisma.relationships.findMany({
    where: {
      cid: { in: postCids },
      metas: {
        type: 'category'
      }
    },
    include: {
      metas: true
    }
  })

  // 创建 cid 到 category 的映射
  const cidToCategoryMap = new Map()
  categoriesData.forEach(item => {
    if (item.metas) {
      cidToCategoryMap.set(item.cid, item.metas.slug)
    }
  })

  // 为每个评论的文章添加 category 字段
  const commentsWithCategory = comments.map(comment => {
    if (comment.posts) {
      return {
        ...comment,
        posts: {
          ...comment.posts,
          category: cidToCategoryMap.get(comment.posts.cid)
        }
      }
    }
    return comment
  })

  // 缓存结果，设置5分钟过期时间
  cacheService.set(cacheKey, commentsWithCategory, 300)

  return commentsWithCategory
}
