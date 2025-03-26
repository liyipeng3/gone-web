import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 处理 POST 请求 - 点赞文章
export async function POST (
  request: NextRequest,
  { params }: { params: { cid: string } }
): Promise<NextResponse> {
  try {
    const cid = parseInt(params.cid)
    if (isNaN(cid)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
    }

    // 查找文章是否存在
    const post = await prisma.posts.findUnique({
      where: { cid }
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 增加点赞数
    const updatedPost = await prisma.posts.update({
      where: { cid },
      data: {
        likesNum: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      likesNum: updatedPost.likesNum
    })
  } catch (error) {
    console.error('点赞失败:', error)
    return NextResponse.json({ error: '点赞失败' }, { status: 500 })
  }
}

// 获取文章点赞数
export async function GET (
  request: NextRequest,
  { params }: { params: { cid: string } }
): Promise<NextResponse> {
  try {
    const cid = parseInt(params.cid)
    if (isNaN(cid)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 })
    }

    // 查找文章
    const post = await prisma.posts.findUnique({
      where: { cid },
      select: { likesNum: true }
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({ likesNum: post.likesNum })
  } catch (error) {
    console.error('获取点赞数失败:', error)
    return NextResponse.json({ error: '获取点赞数失败' }, { status: 500 })
  }
}
