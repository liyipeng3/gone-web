import prisma from '@/lib/prisma'
import NodeCache from 'node-cache'

// 创建缓存实例，设置默认过期时间为5分钟
const cache = new NodeCache({ stdTTL: 300 })

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
      status,
      created: Math.floor(Date.now() / 1000)
    }
  })
  
  // 清除评论相关的缓存
  cache.del('recent_comments')
  
  return result
}

export const getComments = async () => {
  return await prisma.comments.findMany()
}

export const deleteComment = async (coid: number) => {
  // 清除评论相关的缓存
  cache.del('recent_comments')
  
  return await prisma.comments.delete({
    where: { coid }
  })
}

export const updateComment = async (coid: number, data: any) => {
  // 清除评论相关的缓存
  cache.del('recent_comments')
  
  return await prisma.comments.update({
    where: { coid },
    data
  })
}

export const getRecentComments = async (limit: number = 10) => {
  // 使用缓存键
  const cacheKey = `recent_comments_${limit}`
  const cachedData = cache.get(cacheKey)
  
  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData
  }
  
  const comments = await prisma.comments.findMany({
    where: { status: 'approved' },
    orderBy: { created: 'desc' },
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
  
  // 获取所有评论关联的文章的 cid，过滤掉 undefined 值并确保类型正确
  const postCids = comments
    .map(comment => comment.posts?.cid)
    .filter((cid): cid is number => cid !== undefined && cid !== null)
  
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
  
  // 缓存结果
  cache.set(cacheKey, commentsWithCategory)
  
  return commentsWithCategory
}
