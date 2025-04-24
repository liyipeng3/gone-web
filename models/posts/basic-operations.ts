// 帖子基本操作模块
import prisma from '@/lib/prisma'
import { type PostCreateData, type PostUpdateData } from './types'
import { clearPostRelatedCaches, getPostFromCache, setPostCache } from './cache-utils'

/**
 * 创建新帖子
 */
export const createPost = async (data: PostCreateData) => {
  return await prisma.posts.create({
    data
  })
}

/**
 * 根据 cid 更新帖子基本信息
 */
export const updatePostByCid = async (cid: number, data: PostUpdateData) => {
  return await prisma.posts.update({
    where: { cid },
    data
  })
}

/**
 * 根据 cid 删除帖子
 */
export const deletePostByCid = async (cid: number) => {
  clearPostRelatedCaches(cid)
  return await prisma.posts.delete({
    where: { cid }
  })
}

/**
 * 增加帖子浏览量
 */
export const incrementViews = async (cid: number) => {
  // 更新浏览量
  await prisma.posts.update({
    where: { cid },
    data: {
      viewsNum: {
        increment: 1
      }
    }
  })

  // 清除缓存
  clearPostRelatedCaches(cid)
}

/**
 * 检查草稿 slug 是否唯一
 */
export const checkDraftSlugUnique = async (slug: string, excludeCid: number) => {
  const count = await prisma.posts.count({
    where: {
      slug,
      cid: {
        not: excludeCid
      }
    }
  })

  return count === 0
}

/**
 * 获取帖子的 mids（标签和分类的 ID）
 */
export const getPostMids = async (cid: number) => {
  return await prisma.relationships.findMany({
    where: {
      cid
    },
    select: {
      mid: true
    }
  })
}

/**
 * 获取帖子基本信息（标题、slug、分类）
 */
export const getPostInfoByCid = async (cid: number) => {
  const post = await prisma.posts.findUnique({
    include: {
      relationships: {
        include: {
          metas: {
            select: {
              slug: true,
              type: true
            }
          }
        }
      }
    },
    where: {
      cid
    }
  })

  if (!post) {
    throw new Error('文章不存在')
  }

  const category = post.relationships[0]?.metas?.slug ?? 'uncategorized'

  return {
    title: post.title,
    slug: post.slug,
    category
  }
}

/**
 * 根据 slug 获取帖子
 */
export const getPostBySlug = async (slug: string) => {
  const cachedPost = getPostFromCache<any>(slug)
  if (cachedPost) {
    return cachedPost
  }

  const post = await prisma.posts.findUnique({
    include: {
      relationships: {
        include: {
          metas: {
            select: {
              name: true,
              slug: true,
              type: true
            }
          }
        }
      }
    },
    where: {
      slug
    }
  })

  if (post) {
    setPostCache(slug, post)
  }

  return post
}

/**
 * 获取草稿帖子
 */
export const getDraftPostByCid = async (cid: number) => {
  const post = await prisma.posts.findFirst({
    include: {
      relationships: {
        include: {
          metas: true
        }
      }
    },
    where: {
      parent: cid,
      type: 'post_draft'
    }
  })

  return post
}

/**
 * 根据 cid 获取帖子详情
 */
export const getPostByCid = async (cid: number, draft = false) => {
  const cacheKey = `${cid}`
  const cachedPost = getPostFromCache<any>(cacheKey)

  if (cachedPost && !draft) {
    return cachedPost
  }

  // 构建查询条件
  const queries = [
    prisma.posts.findUnique({
      include: {
        relationships: {
          include: {
            metas: {
              select: {
                name: true,
                slug: true,
                type: true
              }
            }
          }
        }
      },
      where: {
        cid
      }
    })
  ]

  // 如果需要草稿数据，添加草稿查询
  if (draft) {
    queries.push(
      prisma.posts.findFirst({
        where: {
          parent: cid
        },
        include: {
          relationships: {
            include: {
              metas: {
                select: {
                  name: true,
                  slug: true,
                  type: true
                }
              }
            }
          }
        }
      })
    )
  }

  // 并行执行查询
  const [post, draftPost] = await Promise.all(queries)

  // 处理返回数据
  let formattedDraftPost = null
  if (draft && draftPost) {
    formattedDraftPost = {
      ...draftPost,
      category: draftPost?.relationships?.find((item: {
        metas: { type: string }
      }) => item.metas.type === 'category')?.metas?.slug,
      tags: draftPost?.relationships?.filter((item: {
        metas: { type: string }
      }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
    }
  }

  const result = {
    ...post,
    draft: formattedDraftPost,
    category: post?.relationships?.find((item: {
      metas: { type: string }
    }) => item.metas.type === 'category')?.metas?.slug,
    tags: post?.relationships?.filter((item: {
      metas: { type: string }
    }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
  }

  // 只缓存已发布的帖子
  if (!draft) {
    setPostCache(cacheKey, result)
  }

  return result
}
