import prisma from '@/utils/prisma'

export const getCategoryList = async () => {
  return await prisma.metas.findMany({
    select: {
      name: true,
      slug: true
    },
    where: {
      type: 'category'
    },
    orderBy: {
      order: 'asc'
    }
  })
}
