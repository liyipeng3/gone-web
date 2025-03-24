import prisma from '@/lib/prisma'
import { marked } from 'marked'
import { type HotList } from '@/types'

import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600 }) // 10分钟缓存

export const getHotList = async (): Promise<HotList> => {
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
    take: 10
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
              slug: true
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
  const data = await prisma.relationships.findMany({
    include: {
      posts: {
        select: {
          title: true,
          slug: true,
          created: true,
          modified: true,
          text: true,
          viewsNum: true,
          likesNum: true
        }
      },
      metas: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    where: {
      metas: {
        type: 'category',
        mid
      },
      posts: {
        status: 'publish',
        type: 'post',
        OR: [{
          title: {
            contains: search
          }
        },
        {
          text: {
            contains: search
          }
        }]
      }
    },
    orderBy: {
      posts: {
        created: 'desc'
      }
    },
    skip: (pageNum - 1) * pageSize,
    take: pageSize
  })

  const total = await prisma.posts.count({
    where: {
      status: 'publish',
      type: 'post',
      OR: [{
        title: {
          contains: search
        }
      },
      {
        text: {
          contains: search
        }
      }],
      relationships: {
        some: {
          metas: {
            mid
          }
        }
      }
    }
  })

  const list = data.map((item: { posts: any, metas: { slug: any, name: any } }) => ({
    ...item.posts,
    category: item.metas.slug,
    name: item.metas.name
  })).map((item: { text: string }) => ({
    ...item,
    description: (marked.parse((item.text?.split('<!--more-->')[0]
      .replaceAll(/```(\n|\r|.)*?```/g, '')
      .slice(0, 150)) ?? '') as string)?.replaceAll(/<.*?>/g, '')
  }))
  return {
    list,
    total
  }
}

export const updatePostTags = async (cid: number, tags: string[]) => {
  // 获取帖子当前的所有标签
  const currentTags = await prisma.relationships.findMany({
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

  // 删除所有与该帖子相关的标签关系，并减少相应标签的count
  for (const tag of currentTags) {
    await prisma.relationships.delete({
      where: {
        cid_mid: {
          cid,
          mid: tag.metas.mid
        }
      }
    })
    await prisma.metas.update({
      where: {
        mid: tag.metas.mid
      },
      data: {
        count: {
          decrement: 1
        }
      }
    })
  }

  // 检查每个新标签是否已经存在，如果不存在则创建新的标签
  for (const tag of tags) {
    let existingTag = await prisma.metas.findUnique({
      where: {
        slug_type: {
          slug: tag,
          type: 'tag'
        }
      }
    })

    if (!existingTag) {
      existingTag = await prisma.metas.create({
        data: {
          name: tag,
          slug: tag,
          type: 'tag',
          count: 1
        }
      })
    } else {
      await prisma.metas.update({
        where: {
          mid: existingTag.mid
        },
        data: {
          count: {
            increment: 1
          }
        }
      })
    }

    // 创建新的标签关系
    await prisma.relationships.create({
      data: {
        cid,
        mid: existingTag.mid
      }
    })
  }
}

export const updatePostCategory = async (cid: number, category: string) => {
  // 获取帖子当前的分类
  const currentCategory = await prisma.relationships.findFirst({
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
    await prisma.relationships.delete({
      where: {
        cid_mid: {
          cid,
          mid: currentCategory.metas.mid
        }
      }
    })
    await prisma.metas.update({
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

  // 检查新分类是否已经存在，如果不存在则创建新的分类
  let existingCategory = await prisma.metas.findUnique({
    where: {
      slug_type: {
        slug: category,
        type: 'category'
      }
    }
  })

  if (!existingCategory) {
    existingCategory = await prisma.metas.create({
      data: {
        name: category,
        slug: category,
        type: 'category',
        count: 1
      }
    })
  } else {
    await prisma.metas.update({
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
  await prisma.relationships.create({
    data: {
      cid,
      mid: existingCategory.mid
    }
  })
}

export const publishPost = async (cid: number) => {
  const draft = await getDraftPostByCid(cid)

  if (!draft) {
    await prisma.posts.update({
      where: {
        cid
      },
      data: {
        status: 'publish',
        type: 'post'
      }
    })
  } else {
    const post = await prisma.posts.delete({
      where: {
        cid
      }
    })
    await prisma.posts.update({
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
  const posts = await prisma.posts.findMany({
    where: {
      status: 'publish',
      type: 'post'
    },
    select: {
      title: true,
      slug: true,
      created: true
    },
    orderBy: {
      created: 'desc'
    }
  })

  const archiveMap = new Map()

  posts.forEach(post => {
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
