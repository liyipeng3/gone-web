import { cache } from 'react'
import { getPostBySlug, getPostList } from '@/models/posts'
import marked from '@/lib/marked'
import { buildExcerpt } from '@/lib/excerpt'
import prisma from '@/lib/prisma'
import { type ListProps } from '@/components/custom/List'

export const getPagePostList = async ({
  pageNum = 1,
  search = ''
}: {
  pageNum?: number
  search?: string
}): Promise<{
  list: any[]
  total: number
}> => {
  const {
    list,
    total
  } = await getPostList({
    pageNum,
    pageSize: 7,
    search
  })

  return {
    list,
    total
  }
}

export const getPagePost = cache(async (slug: string): Promise<{
  title: string
  content: string
  cid: number
  createdAt: Date
}> => {
  const post = await getPostBySlug(slug)
  if (post === null) {
    throw new Error('not found')
  }
  const content = marked.parse(post?.text ?? '') as string

  return {
    title: post.title as string,
    content,
    cid: post.cid,
    createdAt: post.createdAt
  }
})

export const getPageCategoryPostList = cache(async ({
  pageNum = 1,
  category = ''
}): Promise<ListProps> => {
  if (category === '') {
    throw new Error('not found')
  }
  const categoryData = await prisma.metas.findMany({
    where: {
      slug: category
    },
    select: {
      name: true,
      mid: true
    }
  })
  if (categoryData.length !== 1) {
    throw new Error('not found')
  }

  const {
    list,
    total
  } = await getPostList({
    pageNum,
    pageSize: 7,
    mid: categoryData[0].mid
  })
  if (list.length === 0) {
    throw new Error('not found')
  }
  const description = `分类 ${categoryData[0].name as string} 下的文章列表`

  return {
    list,
    total,
    description,
    pageNum,
    baseLink: `/category/${category}/?p=`
  }
})

export const getPagePostInfo = cache(async ({ slug }: { slug: string }): Promise<{
  title: string
  content: string
  createdAt: Date
  name: string
  viewsNum: number
  likesNum: number
  category?: string
  cid?: number
  tags?: string[]
}> => {
  const post = await getPostBySlug(slug)
  if (post === null) {
    throw new Error('not found')
  }
  const content = marked.parse(post.text ?? '') as string

  // 获取文章的标签信息
  const tags = post.relationships
    .filter((relation: any) => relation.metas.type === 'tag')
    .map((relation: any) => relation.metas.slug)

  const categoryRelation = post.relationships
    .find((relation: any) => relation.metas.type === 'category')

  return {
    title: post.title as string,
    content,
    createdAt: post.createdAt,
    name: (categoryRelation?.metas.name ?? '') as string,
    category: (categoryRelation?.metas.slug ?? '') as string,
    viewsNum: post.viewsNum as number,
    likesNum: post.likesNum as number || 0,
    cid: post.cid,
    tags
  }
})

export const getPageTagPostList = cache(async ({
  pageNum = 1,
  tag = ''
}: {
  pageNum?: number
  tag: string
}): Promise<ListProps> => {
  // 查找标签信息
  const tagData = await prisma.metas.findFirst({
    where: {
      type: 'tag',
      slug: tag
    },
    select: {
      mid: true,
      name: true
    }
  })

  if (!tagData) {
    throw new Error('not found')
  }

  // 自定义查询获取与标签关联的文章
  const pageSize = 7
  const data = await prisma.relationships.findMany({
    include: {
      posts: {
        select: {
          cid: true,
          title: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          text: true,
          viewsNum: true,
          likesNum: true
        }
      },
      metas: {
        select: {
          name: true,
          slug: true,
          type: true
        }
      }
    },
    where: {
      mid: tagData.mid,
      posts: {
        status: 'publish',
        type: 'post'
      }
    },
    orderBy: {
      posts: {
        createdAt: 'desc'
      }
    },
    skip: (pageNum - 1) * pageSize,
    take: pageSize
  })

  const total = await prisma.relationships.count({
    where: {
      mid: tagData.mid,
      posts: {
        status: 'publish',
        type: 'post'
      }
    }
  })

  // 批量获取这些文章的分类关系，避免逐篇查询（N+1）
  const cids = data.map((item) => item.posts.cid)
  const categoryRels = cids.length > 0
    ? await prisma.relationships.findMany({
      where: {
        cid: { in: cids },
        metas: {
          type: 'category'
        }
      },
      include: {
        metas: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
    : []

  // 建立 cid -> 分类 的映射
  const cidToCategory = new Map<number, { name: string | null, slug: string | null }>()
  categoryRels.forEach((rel) => {
    if (!cidToCategory.has(rel.cid)) {
      cidToCategory.set(rel.cid, { name: rel.metas.name, slug: rel.metas.slug })
    }
  })

  // 处理文章数据
  const list = data.map((item) => {
    const category = cidToCategory.get(item.posts.cid)

    return {
      ...item.posts,
      category: category?.slug ?? '',
      name: category?.name ?? '',
      description: buildExcerpt(item.posts.text)
    }
  })

  const description = `标签 ${tagData.name} 下的文章列表`

  return {
    list,
    total,
    description,
    pageNum,
    baseLink: `/tag/${tag}/?p=`
  }
})
