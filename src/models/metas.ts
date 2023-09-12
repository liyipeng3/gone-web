import prisma from '@/lib/prisma'

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
