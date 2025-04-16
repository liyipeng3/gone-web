import prisma from '@/lib/prisma'

export const getLinks = async (limit?: number) => {
  return await prisma.links.findMany({
    orderBy: {
      order: 'asc'
    },
    ...(limit ? { take: limit } : {})
  })
}
