// 帖子列表和归档相关操作
import prisma from '@/lib/prisma'
import { type Prisma } from '@prisma/client'
import { buildExcerpt } from '@/lib/excerpt'
import { type GetPostListParams, type ArchiveList, type HotList, type PostListItem } from './types'
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
    const categoryRelation = item.relationships?.[0]
    const category = categoryRelation?.metas?.slug ?? 'uncategorized'

    return {
      title: item.title ?? '',
      slug: item.slug ?? '',
      category
    }
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
  list: PostListItem[]
  total: number
}> => {
  const cachedData = getPostListFromCache(pageNum, pageSize, mid, search)

  if (cachedData) {
    return cachedData
  }

  // 计算分页参数
  const skip = (pageNum - 1) * pageSize

  // 构建查询条件
  const where: Prisma.postsWhereInput = {
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
      createdAt: true,
      updatedAt: true,
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
      createdAt: 'desc'
    },
    skip,
    take: pageSize
  })

  // 批量获取所有帖子的标签和分类，避免逐篇查询（N+1）
  const cids = posts.map((post) => post.cid)
  const relationships = cids.length > 0
    ? await prisma.relationships.findMany({
      where: { cid: { in: cids } },
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
    : []

  // 建立 cid -> relationships 映射
  const cidToRelationships = new Map<number, typeof relationships>()
  relationships.forEach((rel) => {
    const list = cidToRelationships.get(rel.cid) ?? []
    list.push(rel)
    cidToRelationships.set(rel.cid, list)
  })

  const postsWithMetadata = posts.map((post) => {
    const rels = cidToRelationships.get(post.cid) ?? []

    // 提取标签和分类
    const tags = rels
      .filter(r => r.metas.type === 'tag')
      .map(r => r.metas.slug ?? '')

    const categoryRelation = rels.find(r => r.metas.type === 'category')
    const category = categoryRelation?.metas.slug ?? 'uncategorized'
    const name = categoryRelation?.metas.name ?? '未分类'

    // 提取并处理描述
    const description = buildExcerpt(post.text)

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
      createdAt: true,
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
      createdAt: 'desc'
    }
  })

  // 按年月分组
  const archiveMap = new Map()

  posts.forEach(post => {
    const date = post.createdAt ? new Date(post.createdAt) : new Date()
    const time = `${date.getFullYear()} 年 ${String(date.getMonth() + 1).padStart(2, '0')} 月`

    // 带上分类 slug，供归档页拼接文章链接 /post/{category}/{slug}
    const category = post.relationships?.[0]?.metas?.slug ?? 'uncategorized'
    const item = {
      title: post.title,
      slug: post.slug,
      createdAt: post.createdAt,
      category
    }

    if (!archiveMap.has(time)) {
      archiveMap.set(time, [])
    }

    archiveMap.get(time).push(item)
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
