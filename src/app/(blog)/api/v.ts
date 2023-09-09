// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prisma'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const visitTimesData = await prisma.options?.findFirst({
    where: {
      name: 'visitTimes'
    },
    select: {
      value: true
    }
  })
  const visitTimes = visitTimesData?.value ?? 0
  res.status(200).json({ visitTimes })
}
