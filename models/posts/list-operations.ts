// 帖子列表和归档相关操作
import prisma from '@/lib/prisma'
import { marked } from 'marked'
import { type GetPostListParams, type ArchiveList, type HotList } from './types'
import {
  getHotListFromCache,
  setHotListCache,
  getArchiveListFromCache,
  setArchiveListCache,
  getPostListFromCache,
  setPostListCache
} from './cache-utils'

/**
 * 获取热门帖子列表
 */
export const getHotList = async (limit: number = 5): Promise<HotList> => {
  const cachedData = getHotListFromCache(limit)

  if (cachedData) {
    return cachedData
  }

  // 使用 Prisma 查询获取热门帖子
  const hotData = await prisma.posts.findMany({
    select: {
      title: true,
      slug: true,
      relationships: {
        include: {
          metas: {
            select: {
              slug: true,
              type: true
            }
          }
        },
        where: {
          metas: {
            type: 'category'
          }
        }
      }
    },
    where: {
      status: 'publish',
      type: 'post'
    },
    orderBy: {
      viewsNum: 'desc'
    },
    take: limit
  })

  const result: HotList = hotData.map(item => {
    const categoryRelation = item.relationships?.[0];
    const category = categoryRelation?.metas?.slug ?? 'uncategorized';
    
    return {
      title: item.title ?? '',
      slug: item.slug ?? '',
      category
    };
  })

  setHotListCache(limit, result)
  return result
}

/**
 * 获取帖子列表
 */
export const getPostList = async ({
  pageNum,
  pageSize = 7,
  mid,
  search = ''
}: GetPostListParams): Promise<{
  list: any[]
  total: number
}> => {
  const cachedData = getPostListFromCache(pageNum, pageSize, mid, search)

  if (cachedData) {
    return cachedData
  }

  // 计算分页参数
  const skip = (pageNum - 1) * pageSize

  // 构建查询条件
  const where: any = {
    status: 'publish',
    type: 'post'
  }

  // 如果有搜索关键词
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { text: { contains: search } }
    ]
  }

  // 如果有分类或标签筛选
  if (mid) {
    where.relationships = {
      some: {
        mid
      }
    }
  }

  // 获取总数
  const total = await prisma.posts.count({ where })

  // 获取帖子列表
  const posts = await prisma.posts.findMany({
    select: {
      cid: true,
      title: true,
      slug: true,
      created: true,
      modified: true,
      text: true,
      viewsNum: true,
      likesNum: true,
      // 直接在这里包含评论数，减少额外的查询
      _count: {
        select: {
          comments: {
            where: {
              status: 'approved'
            }
          }
        }
      }
    },
    where,
    orderBy: {
      created: 'desc'
    },
    skip,
    take: pageSize
  })

  // 为每个帖子获取标签和分类
  const postsWithMetadata = await Promise.all(
    posts.map(async (post) => {
      const relationships = await prisma.relationships.findMany({
        where: { cid: post.cid },
        include: {
          metas: {
            select: {
              name: true,
              slug: true,
              type: true
            }
          }
        }
      })

      // 提取标签和分类
      const tags = relationships
        .filter(r => r.metas.type === 'tag')
        .map(r => r.metas.slug ?? '')

      const categoryRelation = relationships.find(r => r.metas.type === 'category')
      const category = categoryRelation?.metas.slug ?? 'uncategorized'
      const name = categoryRelation?.metas.name ?? '未分类'

      // 提取并处理描述
      let description = ''
      if (post.text) {
        const textPart = post.text.split('<!--more-->')[0]
          .replaceAll(/```(\n|\r|.)*?```/g, '')
          .slice(0, 150)

        description = (marked.parse(textPart) as string).replaceAll(/<.*?>/g, '')
      }

      const commentsNum = post._count?.comments || 0

      return {
        ...post,
        tags,
        category,
        name,
        description,
        commentsNum,
        // 移除不需要的字段
        _count: undefined
      }
    })
  )

  const result = {
    list: postsWithMetadata,
    total
  }

  setPostListCache(pageNum, pageSize, result, mid, search)
  return result
}

/**
 * 获取归档列表
 */
export const getArchiveList = async (): Promise<ArchiveList> => {
  const cachedData = getArchiveListFromCache()

  if (cachedData) {
    return cachedData
  }

  const posts = await prisma.posts.findMany({
    select: {
      title: true,
      slug: true,
      created: true
    },
    where: {
      status: 'publish',
      type: 'post'
    },
    orderBy: {
      created: 'desc'
    }
  })

  // 按年月分组
  const archiveMap = new Map()

  posts.forEach(post => {
    const date = new Date((post.created ?? 0) * 1000)
    const time = `${date.getFullYear()} 年 ${String(date.getMonth() + 1).padStart(2, '0')} 月`

    if (!archiveMap.has(time)) {
      archiveMap.set(time, [])
    }

    archiveMap.get(time).push(post)
  })

  // 转换为数组格式
  const result = Array.from(archiveMap.entries()).map(([time, posts]) => ({
    time,
    posts
  }))

  // 缓存结果
  setArchiveListCache(result)
  return result
}
