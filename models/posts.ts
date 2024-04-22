import prisma from '@/lib/prisma'
import { marked } from 'marked'
import { type HotList } from '@/types'

export const getHotList = async (): Promise<HotList> => {
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
  return hotData.map((item: { posts: any, metas: { slug: any } }) => ({
    ...item.posts,
    category: item.metas.slug
  })) as HotList
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
  await prisma.relationships.deleteMany({
    where: {
      posts: {
        cid
      }
    }
  })
  const categoryMid = (await prisma.metas.findFirst({
    where: {
      slug: category,
      type: 'category'
    }
  }))?.mid

  for (let i = 0; i < tags.length; i++) {
    const tagMid = (await prisma.metas.findFirst({
      where: {
        slug: tags[i],
        type: 'tag'
      }
    }))?.mid
    if (tagMid === undefined) {
      await prisma.metas.create({
        data: {
          name: tags[i],
          slug: tags[i],
          type: 'tag',
          count: 0
        }
      })
    } else {
      const count = (await prisma.relationships.count({
        where: {
          metas: {
            mid: tagMid
          }
        }
      }))
      await prisma.metas.update({
        where: {
          mid: tagMid
        },
        data: {
          count
        }
      })
    }
    await prisma.relationships.create({
      data: {
        metas: {
          connect: {
            mid: tagMid
          }
        },
        posts: {
          connect: {
            cid
          }
        }
      }
    })
  }
  return await prisma.relationships.create({
    data: {
      metas: {
        connect: {
          mid: categoryMid
        }
      },
      posts: {
        connect: {
          cid
        }
      }
    }
  })
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
  let draftPost = null
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
      cid
    }
  })

  if (draft && post) {
    const draft = await getDraftPostByCid(post.cid)
    draftPost = {
      ...draft,
      category: draft?.relationships?.find((item: {
        metas: { type: string }
      }) => item.metas.type === 'category')?.metas?.slug,
      tags: draft?.relationships?.filter((item: {
        metas: { type: string }
      }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
    }
  }

  return {
    ...post,
    draft: draftPost,
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
    await prisma.posts.delete({
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
        slug: String(draft?.slug).slice(1)
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
