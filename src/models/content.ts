import prisma from '@/lib/prisma'
import { marked } from 'marked'
import { type HotList } from '@/types'

export const getHotList = async (): Promise<HotList> => {
  const hotData = await prisma.relationships.findMany({
    include: {
      contents: {
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
      contents: {
        status: 'publish',
        type: 'post'
      }
    },
    orderBy: {
      contents: {
        viewsNum: 'desc'
      }
    },
    take: 10
  })
  return hotData.map(item => ({
    ...item.contents,
    category: item.metas.slug
  })) as HotList
}

export const getPost = async (slug: string) => {
  return await prisma.contents.findUnique({
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
  await prisma.contents.update({
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
      contents: {
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
      contents: {
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
      contents: {
        created: 'desc'
      }
    },
    skip: (pageNum - 1) * pageSize,
    take: pageSize
  })

  const total = await prisma.contents.count({
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

  const list = data.map(item => ({
    ...item.contents,
    category: item.metas.slug,
    name: item.metas.name
  })).map(item => ({
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
