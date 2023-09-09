// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getCategoryList } from '@/models/metas'
import { NextResponse } from 'next/server'

export async function GET (
  request: Request
) {
  const categoryList = await getCategoryList()
  return NextResponse.json(categoryList)
}
