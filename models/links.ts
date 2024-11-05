import prisma from '@/lib/prisma'

export const getLinks = async () => {
  return await prisma.links.findMany()
}
