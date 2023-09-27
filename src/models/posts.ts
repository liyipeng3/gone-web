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
      cid
    }
  })

  if (draft && post) {
    draftPost = await getDraftPostByCid(post.cid)
  }

  return { ...post, draft: draftPost }
}

export const getDraftPostByCid = async (cid: number) => {
  return await prisma.posts.findFirst({
    where: {
      parent: cid
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

export const createPost = async (data: any) => {
  console.log(data)
  return await prisma.posts.create({
    data: {
      ...data,
      relationships: {
        create: null
      }
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
    description: marked.parse((item.text?.split('<!--more-->')[0]
      .replaceAll(/```(\n|\r|.)*?```/g, '')
      .slice(0, 150)) ?? '')?.replaceAll(/<.*?>/g, '')
  }))
  return {
    list,
    total
  }
}
