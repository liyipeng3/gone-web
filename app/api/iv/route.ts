// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET (
  request: NextRequest
) {
  try {
    const res = await prisma.options.update({
      where: {
        name: 'visitTimes'
      },
      data: {
        value: {
          increment: 1
        }
      }
    })

    return NextResponse.json(res)
  } catch (error) {
    console.error('更新访问量失败:', error)
    return NextResponse.json({ error: '更新访问量失败' }, { status: 500 })
  }
}
