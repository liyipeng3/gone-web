import prisma from '@/utils/prisma'

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
        views: 'desc'
      }
    },
    take: 10
  })
  return hotData.map(item => ({
    ...item.contents,
    category: item.metas.slug
  }))
}
