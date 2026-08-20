import prisma from '@/lib/prisma'

export interface DashboardStats {
  posts: {
    published: number
    draft: number
  }
  comments: {
    total: number
    approved: number
    waiting: number
    spam: number
  }
  gallery: number
  views: number
  likes: number
  visitTimes: number
}

/**
 * 聚合后台概览统计。所有查询并行执行，数据均为只读聚合。
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    publishedPosts,
    draftPosts,
    commentGroups,
    galleryCount,
    postAggregate,
    visitTimesData
  ] = await Promise.all([
    prisma.posts.count({ where: { type: 'post', status: 'publish' } }),
    // 草稿以独立行存在（type = post_draft）
    prisma.posts.count({ where: { type: 'post_draft' } }),
    prisma.comments.groupBy({ by: ['status'], _count: true }),
    prisma.gallery.count(),
    prisma.posts.aggregate({
      where: { type: 'post', status: 'publish' },
      _sum: { viewsNum: true, likesNum: true }
    }),
    prisma.options.findFirst({ where: { name: 'visitTimes' }, select: { value: true } })
  ])

  const commentByStatus = commentGroups.reduce<Record<string, number>>((acc, cur) => {
    if (cur.status) acc[cur.status] = cur._count
    return acc
  }, {})

  const commentTotal = commentGroups.reduce((sum, cur) => sum + cur._count, 0)

  return {
    posts: {
      published: publishedPosts,
      draft: draftPosts
    },
    comments: {
      total: commentTotal,
      approved: commentByStatus.approved ?? 0,
      waiting: commentByStatus.waiting ?? 0,
      spam: commentByStatus.spam ?? 0
    },
    gallery: galleryCount,
    views: postAggregate._sum.viewsNum ?? 0,
    likes: postAggregate._sum.likesNum ?? 0,
    visitTimes: visitTimesData?.value ?? 0
  }
}
