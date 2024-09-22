import { NextResponse } from 'next/server'
import { createComment, deleteComment, getCommentsByCid } from '@/models/comments'

export async function POST (request: Request) {
  const { cid, author, text } = await request.json()
  const comment = await createComment(cid, { author, text })
  return NextResponse.json(comment)
}

export async function DELETE (request: Request) {
  const { coid } = await request.json()
  await deleteComment(coid)
  return NextResponse.json({ success: true })
}

export async function GET (request: Request, context: { params: { cid: string } }) {
  console.log(1,context)
  console.log(context.params.cid)
  const comments = await getCommentsByCid(Number(context.params.cid))
  return NextResponse.json(comments)
}
