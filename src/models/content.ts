import prisma from '@/utils/prisma'
import { marked } from 'marked'

export const getHotList = async () => {
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
  }))
}

export const getPost = async (slug: string) => {
  return await prisma.contents.findUnique({
    include: {
      relationships: {
        include: {
          metas: {
            select: {
              name: true
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

export const getPostList = async (pageNum: number, pageSize: number = 7, category?: string) => {
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
        slug: category
      },
      contents: {
        status: 'publish',
        type: 'post'
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
      type: 'post'
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
