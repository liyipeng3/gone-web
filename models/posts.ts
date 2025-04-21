import prisma from '@/lib/prisma'
import { marked } from 'marked'
import { type HotList } from '@/types'

import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600 }) // 10分钟缓存

export const getHotList = async (limit: number = 5): Promise<HotList> => {
  const cacheKey = 'hot_list'
  const cachedData = cache.get<HotList>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const hotData = await prisma.relationships.findMany({
    include: {
      posts: {
        select: {
          title: true,
          slug: true
        }
      },
      metas: {
        select: {
          slug: true
        }
      }
    },
    where: {
      metas: {
        type: 'category'
      },
      posts: {
        status: 'publish',
        type: 'post'
      }
    },
    orderBy: {
      posts: {
        viewsNum: 'desc'
      }
    },
    take: limit
  })

  const result = hotData.map((item: { posts: any, metas: { slug: any } }) => ({
    ...item.posts,
    category: item.metas.slug
  })) as HotList

  cache.set(cacheKey, result)
  return result
}

export const getPostBySlug = async (slug: string) => {
  return await prisma.posts.findUnique({
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
}

export const updateMetas = async (cid: number, category: string, tags: string[]) => {
  // 删除旧关系
  await prisma.relationships.deleteMany({
    where: {
      posts: {
        cid
      }
    }
  })
  // 获取分类 mid
  const categoryMeta = await prisma.metas.findFirst({
    where: {
      slug: category,
      type: 'category'
    }
  })

  // 批量处理标签
  const tagOperations = tags.map(async (tag) => {
    const tagMeta = await prisma.metas.findFirst({
      where: {
        slug: tag,
        type: 'tag'
      }
    })
    if (!tagMeta) {
      // 创建新标签
      const newTag = await prisma.metas.create({
        data: {
          name: tag,
          slug: tag,
          type: 'tag',
          count: 0
        }
      })
      return newTag.mid
    }

    return tagMeta.mid
  })

  // 并行处理所有标签
  const tagMids = await Promise.all(tagOperations)

  // 准备创建关系的数据
  const relationshipData = [
    ...tagMids.map(mid => ({ cid, mid })),
    { cid, mid: categoryMeta?.mid }
  ].filter(item => item.mid !== undefined)

  // 准备创建关系的数据
  const createPromises = []
  for (const data of relationshipData) {
    createPromises.push(
      prisma.relationships.create({
        data: {
          cid: data.cid,
          mid: data.mid as number
        }
      })
    )
  }

  // 使用事务批量创建关系
  return await prisma.$transaction(createPromises)
}

export const updatePost = async (cid: number, data: any) => {
  return await prisma.posts.update({
    where: {
      cid
    },
    data
  })
}

export const incrementViews = async (cid: number) => {
  await prisma.posts.update({
    where: {
      cid
    },
    data: {
      viewsNum: {
        increment: 1
      }
    }
  })
}

export const getPostByCid = async (cid: number, draft?: boolean) => {
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

  return {
    ...post,
    draft: formattedDraftPost,
    category: post?.relationships?.find((item: {
      metas: { type: string }
    }) => item.metas.type === 'category')?.metas?.slug,
    tags: post?.relationships?.filter((item: {
      metas: { type: string }
    }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
  }
}

export const getPostMids = async (cid: number) => {
  const relationships = await prisma.relationships.findMany({
    where: {
      posts: {
        cid
      }
    }
  })
  return relationships.map((item: { mid: any }) => item.mid)
}

export const getDraftPostByCid = async (cid: number) => {
  return await prisma.posts.findFirst({
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
}

export const updatePostByCid = async (cid: number, data: any) => {
  return await prisma.posts.update({
    where: {
      cid
    },
    data
  })
}

export const deletePostByCid = async (cid: number) => {
  return await prisma.posts.delete({
    where: {
      cid
    }
  })
}

export const createPost = async (data: any) => {
  return await prisma.posts.create({
    data: {
      ...data
    }
  })
}

interface getPostListParams {
  pageNum: number
  pageSize?: number
  mid?: number
  search?: string
}

export const getPostList: (postListParams: getPostListParams) => Promise<any> = async ({
  pageNum,
  pageSize = 7,
  mid,
  search = ''
}) => {
  // 使用缓存键，包含所有查询参数
  const cacheKey = `post_list_${pageNum}_${pageSize}_${mid || 'all'}_${search}`
  const cachedData = cache.get(cacheKey)
  
  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData
  }
  
  // 构建查询条件
  const whereCondition = {
    metas: {
      type: 'category'
    },
    posts: {
      status: 'publish',
      type: 'post'
    }
  } as any
  
  // 只有在有搜索条件时才添加 OR 条件，避免不必要的复杂查询
  if (search) {
    whereCondition.posts.OR = [
      { title: { contains: search } },
      { text: { contains: search } }
    ]
  }
  
  // 只有在指定分类时才添加 mid 条件
  if (mid) {
    whereCondition.metas.mid = mid
  }
  
  const data = await prisma.relationships.findMany({
    include: {
      posts: {
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
        }
      },
      metas: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    where: whereCondition,
    orderBy: {
      posts: {
        created: 'desc'
      }
    },
    skip: (pageNum - 1) * pageSize,
    take: pageSize
  })

  // 构建总数查询条件
  const countWhereCondition = {
    status: 'publish',
    type: 'post',
    relationships: {
      some: {
        metas: {}
      }
    }
  } as any
  
  if (search) {
    countWhereCondition.OR = [
      { title: { contains: search } },
      { text: { contains: search } }
    ]
  }
  
  if (mid) {
    countWhereCondition.relationships.some.metas.mid = mid
  }
  
  const total = await prisma.posts.count({
    where: countWhereCondition
  })

  // 处理数据，避免多次遍历
  const list = data.map((item: any) => {
    const post = item.posts
    const commentsNum = post._count?.comments || 0
    
    // 提取并处理描述
    let description = ''
    if (post.text) {
      const textPart = post.text.split('<!--more-->')[0]
        .replaceAll(/```(\n|\r|.)*?```/g, '')
        .slice(0, 150)
      
      description = (marked.parse(textPart) as string)?.replaceAll(/<.*?>/g, '')
    }
    
    return {
      ...post,
      category: item.metas.slug,
      name: item.metas.name,
      description,
      commentsNum,
      // 移除不需要的字段
      _count: undefined
    }
  })

  const result = {
    list,
    total
  }
  
  // 缓存结果，设置较短的缓存时间（2分钟）
  cache.set(cacheKey, result, 120)
  
  return result
}

export const updatePostTags = async (cid: number, tags: string[]) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
    // 获取帖子当前的所有标签
    const currentTags = await tx.relationships.findMany({
      where: {
        posts: {
          cid
        },
        metas: {
          type: 'tag'
        }
      },
      include: {
        metas: true
      }
    })

    // 获取当前标签的 mid 列表
    const currentTagMids = currentTags.map(tag => tag.metas.mid)
    
    // 批量删除所有与该帖子相关的标签关系
    if (currentTagMids.length > 0) {
      await tx.relationships.deleteMany({
        where: {
          cid,
          mid: {
            in: currentTagMids
          }
        }
      })
    }
    
    // 批量更新标签计数
    const decrementPromises = currentTagMids.map(mid => 
      tx.metas.update({
        where: { mid },
        data: { count: { decrement: 1 } }
      })
    )
    
    // 并行执行所有减少计数的操作
    if (decrementPromises.length > 0) {
      await Promise.all(decrementPromises)
    }
    
    // 处理新标签
    const tagOperations = tags.map(async (tag) => {
      const tagMeta = await tx.metas.findFirst({
        where: {
          slug: tag,
          type: 'tag'
        }
      })
      
      if (!tagMeta) {
        // 创建新标签
        const newTag = await tx.metas.create({
          data: {
            name: tag,
            slug: tag,
            type: 'tag',
            count: 1
          }
        })
        
        // 创建关系
        await tx.relationships.create({
          data: {
            cid,
            mid: newTag.mid
          }
        })
        
        return newTag.mid
      } else {
        // 更新已有标签计数
        await tx.metas.update({
          where: { mid: tagMeta.mid },
          data: { count: { increment: 1 } }
        })
        
        // 创建关系
        await tx.relationships.create({
          data: {
            cid,
            mid: tagMeta.mid
          }
        })
        
        return tagMeta.mid
      }
    })
    
    // 并行处理所有标签操作
    await Promise.all(tagOperations)
    
    // 清除相关缓存
    cache.del(`post_${cid}`)
    cache.del('hot_list')
    
    return { success: true }
  })
}

export const updatePostCategory = async (cid: number, category: string) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
    // 获取当前分类
    const currentCategory = await tx.relationships.findFirst({
      where: {
        posts: {
          cid
        },
        metas: {
          type: 'category'
        }
      },
      include: {
        metas: true
      }
    })

    // 删除与该帖子相关的分类关系，并减少相应分类的count
    if (currentCategory) {
      await tx.relationships.delete({
        where: {
          cid_mid: {
            cid,
            mid: currentCategory.metas.mid
          }
        }
      })
      
      await tx.metas.update({
        where: {
          mid: currentCategory.metas.mid
        },
        data: {
          count: {
            decrement: 1
          }
        }
      })
    }

    // 检查新分类是否已经存在
    let existingCategory = await tx.metas.findUnique({
      where: {
        slug_type: {
          slug: category,
          type: 'category'
        }
      }
    })

    // 如果不存在则创建新的分类，否则更新计数
    if (!existingCategory) {
      existingCategory = await tx.metas.create({
        data: {
          name: category,
          slug: category,
          type: 'category',
          count: 1
        }
      })
    } else {
      await tx.metas.update({
        where: {
          mid: existingCategory.mid
        },
        data: {
          count: {
            increment: 1
          }
        }
      })
    }

    // 创建新的分类关系
    await tx.relationships.create({
      data: {
        cid,
        mid: existingCategory.mid
      }
    })
    
    // 清除相关缓存
    cache.del(`post_${cid}`)
    cache.del('hot_list')
    
    return { success: true }
  })
}

export const publishPost = async (cid: number) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
    const draft = await getDraftPostByCid(cid)

    if (!draft) {
      // 如果没有草稿，直接更新状态
      await tx.posts.update({
        where: {
          cid
        },
        data: {
          status: 'publish',
          type: 'post'
        }
      })
    } else {
      // 如果有草稿，先获取原文章信息
      const post = await tx.posts.findUnique({
        where: {
          cid
        }
      })
      
      if (!post) {
        throw new Error(`Post with cid ${cid} not found`)
      }
      
      // 删除原文章
      await tx.posts.delete({
        where: {
          cid
        }
      })
      
      // 更新草稿为正式文章
      await tx.posts.update({
        where: {
          cid: draft.cid
        },
        data: {
          cid,
          status: 'publish',
          type: 'post',
          parent: 0,
          slug: String(draft?.slug).slice(1),
          created: post.created,
          commentsNum: post.commentsNum,
          viewsNum: post.viewsNum,
          likesNum: post.likesNum
        }
      })
    }
    
    // 清除相关缓存
    cache.del(`post_${cid}`)
    cache.del('hot_list')
    // 清除分页缓存
    const cacheKeys = cache.keys()
    cacheKeys.forEach(key => {
      if (key.startsWith('post_list_')) {
        cache.del(key)
      }
    })
    
    return { success: true }
  })
}

export async function checkDraftSlugUnique (slug: string, excludeCid: number) {
  const post = await prisma.posts.findUnique({
    where: {
      slug,
      NOT: {
        cid: excludeCid
      }

    }
  })

  return !post
}

export const getArchiveList = async () => {
  const posts = await prisma.relationships.findMany({
    include: {
      posts: {
        select: {
          title: true,
          slug: true,
          created: true
        }
      },
      metas: {
        select: {
          slug: true
        }
      }
    },
    where: {
      metas: {
        type: 'category'
      },
      posts: {
        status: 'publish',
        type: 'post'
      }
    },
    orderBy: {
      posts: {
        created: 'desc'
      }
    }
  })

  const formattedPosts = posts.map((item) => ({
    ...item.posts,
    category: item.metas.slug
  }))

  const archiveMap = new Map()

  formattedPosts.forEach(post => {
    const date = new Date((post.created ?? 0) * 1000)
    const time = `${date.getFullYear()} 年 ${String(date.getMonth() + 1).padStart(2, '0')} 月`

    if (!archiveMap.has(time)) {
      archiveMap.set(time, [])
    }

    archiveMap.get(time).push(post)
  })

  return Array.from(archiveMap.entries()).map(([time, posts]) => ({
    time,
    posts
  }))
}

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
        },
        where: {
          metas: {
            type: 'category'
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

  const category = post.relationships[0]?.metas?.slug || 'uncategorized'

  return {
    title: post.title,
    slug: post.slug,
    category
  }
}
