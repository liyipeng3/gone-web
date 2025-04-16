import prisma from '@/lib/prisma'

export const getTags = async (limit: number = 30) => {
  return await prisma.metas.findMany({
    where: { type: 'tag' },
    orderBy: { count: 'desc' },
    take: limit
  })
}
