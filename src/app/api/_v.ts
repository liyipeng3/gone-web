// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prisma.options.update({
    where: {
      name: 'visitTimes'
    },
    data: {
      value: {
        increment: 1
      }
    }
  })
}
