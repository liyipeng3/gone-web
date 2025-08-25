import prisma from '@/lib/prisma'
import { cacheService, cacheKeys } from '@/lib/cache'

export const getCommentsByCid = async (cid: number) => {
  return await prisma.comments.findMany({
    where: { cid, status: 'approved' }
  })
}

export const getCommentById = async (coid: number) => {
  return await prisma.comments.findUnique({
    where: { coid }
  })
}

export const createComment = async (cid: number, parent: number = 0, data: any) => {
  const email = data.email
  let status = 'waiting'
  // 同一邮箱只需审核一次
  const beforeComment = await prisma.comments.findFirst({
    where: { email, status: 'approved' }
  })
  if (beforeComment) {
    status = 'approved'
  }

  const result = await prisma.comments.create({
    data: {
      ...data,
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

export const updateComment = async (coid: number, data: any) => {
  // 清除评论相关的缓存
  cacheService.delByPrefix(cacheKeys.recentComments)

  return await prisma.comments.update({
    where: { coid },
    data
  })
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
