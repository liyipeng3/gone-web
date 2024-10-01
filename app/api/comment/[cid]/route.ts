import { NextResponse } from 'next/server'
import { createComment, deleteComment, getCommentsByCid, updateComment } from '@/models/comments'

export async function POST (request: Request, context: { params: { cid: string } }) {
  const { author, text, parent, mail, url } = await request.json()
  const agent = request.headers.get('User-Agent')
  const ip = request.headers.get('X-Forwarded-For')
  const comment = await createComment(Number(context.params.cid), Number(parent), { author, text, mail, url, agent, ip })
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
  await updateComment(Number(coid), comment)
  return NextResponse.json({ success: true })
}
