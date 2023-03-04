// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getCategoryList } from '@/models/metas'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const categoryList = await getCategoryList()
  res.status(200).json(categoryList)
}
