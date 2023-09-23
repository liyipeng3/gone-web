// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const posts = await prisma.posts.findMany({
  //   select: {
  //     cid: true,
  //     created: true,
  //     modified: true
  //   }
  // })
  //
  // for (const item of posts) {
  //   await prisma.posts.update({
  //     where: {
  //       cid: item.cid
  //     },
  //     data: {
  //       created: item.created,
  //       modified: item.modified
  //     }
  //   })
  // }
}
