import { NextResponse } from 'next/server'
import { createComment, deleteComment, getCommentsByCid, updateComment, getCommentById } from '@/models/comments'
import { sendCommentNotification, sendReplyNotification, sendCommentApprovedNotification } from '@/lib/email'
import { getPostInfoByCid } from '@/models/posts'
import { requireAdmin, isAuthResponse } from '@/lib/api-auth'
import { commentCreateSchema } from '@/lib/validations/comment'

export async function POST (request: Request, context: { params: { cid: string } }) {
  const body = await request.json()
  const parsed = commentCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败', issues: parsed.error.issues }, { status: 400 })
  }

  const { author, text, parent = 0, email, url } = parsed.data
  const agent = request.headers.get('User-Agent')
  const ip = request.headers.get('X-Forwarded-For')
  const comment = await createComment(Number(context.params.cid), Number(parent), { author, text, email, url, agent, ip })

  // 邮件通知不阻塞响应：后台并行取数并发送，失败仅记录日志
  void (async () => {
    const [postInfo, originalComment] = await Promise.all([
      getPostInfoByCid(Number(context.params.cid)),
      parent && parent > 0 ? getCommentById(Number(parent)) : Promise.resolve(null)
    ])
    const postUrl = `${process.env.SITE_URL}/post/${postInfo.category}/${postInfo.slug}`

    // 标记是否需要发送管理员通知
    let shouldNotifyAdmin = true

    // 如果是回复评论，且不是回复自己，则发送回复通知邮件
    if (originalComment?.email && originalComment.email !== email) {
      await sendReplyNotification(originalComment, comment, postInfo.title ?? '暂无标题', postUrl)

      // 如果被回复的人是博客作者（管理员），则不需要再发送管理员通知
      if (originalComment.email === process.env.ADMIN_EMAIL) {
        shouldNotifyAdmin = false
      }
    }

    // 给博客管理员发送新评论通知（如果需要）
    if (shouldNotifyAdmin) {
      await sendCommentNotification(comment, postInfo.title ?? '暂无标题', postUrl)
    }
  })().catch(err => { console.error('评论通知邮件发送失败:', err) })

  return NextResponse.json(comment)
}

export async function DELETE (request: Request, context: { params: { cid: string } }) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const { coid } = await request.json()
  await deleteComment(coid)
  return NextResponse.json({ success: true })
}

export async function GET (request: Request, context: { params: { cid: string } }) {
  const comments = await getCommentsByCid(Number(context.params.cid))
  return NextResponse.json(comments)
}

export async function PATCH (request: Request, context: { params: { cid: string } }) {
  const auth = await requireAdmin()
  if (isAuthResponse(auth)) return auth

  const { coid, comment } = await request.json()

  // 获取更新前的评论信息
  const oldComment = await getCommentById(Number(coid))

  // 更新评论
  await updateComment(Number(coid), comment)

  // 如果评论状态从待审核变为已批准，则发送审核通过通知
  if (oldComment && oldComment.status !== 'approved' && comment.status === 'approved' && oldComment.email) {
    // 获取文章信息用于邮件通知
    const postInfo = await getPostInfoByCid(Number(oldComment.cid))
    const postUrl = `${process.env.SITE_URL}/post/${postInfo.category}/${postInfo.slug}`

    // 发送评论审核通过通知
    await sendCommentApprovedNotification(oldComment, postInfo.title ?? '暂无标题', postUrl)
  }

  return NextResponse.json({ success: true })
}
