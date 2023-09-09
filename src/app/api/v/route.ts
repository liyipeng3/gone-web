// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from '@/utils/prisma'
import { NextResponse } from 'next/server'

export async function GET (
  request: Request
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

  return NextResponse.json({ visitTimes })
}
