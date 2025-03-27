import { NextResponse } from 'next/server'
import { createComment, deleteComment, getCommentsByCid, updateComment, getCommentById } from '@/models/comments'
import { sendCommentNotification, sendReplyNotification, sendCommentApprovedNotification } from '@/lib/email'
import { getPostInfoByCid } from '@/models/posts'

export async function POST (request: Request, context: { params: { cid: string } }) {
  const { author, text, parent, mail, url } = await request.json()
  const agent = request.headers.get('User-Agent')
  const ip = request.headers.get('X-Forwarded-For')
  const comment = await createComment(Number(context.params.cid), Number(parent), { author, text, mail, url, agent, ip })

  // 获取文章信息用于邮件通知
  const postInfo = await getPostInfoByCid(Number(context.params.cid))
  const postUrl = `${process.env.SITE_URL}/post/${postInfo.category}/${postInfo.slug}`

  // 标记是否需要发送管理员通知
  let shouldNotifyAdmin = true

  // 如果是回复评论，则发送回复通知邮件
  if (parent && parent > 0) {
    const originalComment = await getCommentById(Number(parent))
    if (originalComment?.mail) {
      // 不给自己发邮件
      if (originalComment.mail !== mail) {
        await sendReplyNotification(originalComment, comment, postInfo.title ?? '暂无标题', postUrl)

        // 如果被回复的人是博客作者（管理员），则不需要再发送管理员通知
        if (originalComment.mail === process.env.ADMIN_EMAIL) {
          shouldNotifyAdmin = false
        }
      }
    }
  }

  // 给博客管理员发送新评论通知（如果需要）
  if (shouldNotifyAdmin) {
    await sendCommentNotification(comment, postInfo.title ?? '暂无标题', postUrl)
  }

  return NextResponse.json(comment)
}

export async function DELETE (request: Request, context: { params: { cid: string } }) {
  const { coid } = await request.json()
  await deleteComment(coid)
  return NextResponse.json({ success: true })
}

export async function GET (request: Request, context: { params: { cid: string } }) {
  const comments = await getCommentsByCid(Number(context.params.cid))
  return NextResponse.json(comments)
}

export async function PATCH (request: Request, context: { params: any }) {
  const { coid, comment } = await request.json()

  // 获取更新前的评论信息
  const oldComment = await getCommentById(Number(coid))

  // 更新评论
  await updateComment(Number(coid), comment)

  // 如果评论状态从待审核变为已批准，则发送审核通过通知
  if (oldComment && oldComment.status !== 'approved' && comment.status === 'approved' && oldComment.mail) {
    // 获取文章信息用于邮件通知
    const postInfo = await getPostInfoByCid(Number(oldComment.cid))
    const postUrl = `${process.env.SITE_URL}/post/${postInfo.category}/${postInfo.slug}`

    // 发送评论审核通过通知
    await sendCommentApprovedNotification(oldComment, postInfo.title ?? '暂无标题', postUrl)
  }

  return NextResponse.json({ success: true })
}
