import prisma from '@/lib/prisma'

export const getCommentsByCid = async (cid: number) => {
  return await prisma.comments.findMany({
    where: { cid }
  })
}

export const createComment = async (cid: number, parent: number = 0, data: any) => {
  return await prisma.comments.create({
    data: {
      ...data,
      cid,
      parent,
      status: 'pending',
      created: Math.floor(Date.now() / 1000)
    }
  })
}

export const getComments = async () => {
  return await prisma.comments.findMany()
}

export const deleteComment = async (coid: number) => {
  return await prisma.comments.delete({
    where: { coid }
  })
}
