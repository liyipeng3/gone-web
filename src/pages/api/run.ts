// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const contents = await prisma.contents.findMany({
  //   select: {
  //     cid: true,
  //     created: true,
  //     modified: true
  //   }
  // })
  //
  // for (const item of contents) {
  //   await prisma.contents.update({
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
