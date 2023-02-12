// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// interface Data {
//   name: string
// }

// export default function handler (
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
//
export default function handler (
  req: NextApiRequest,
  res: NextApiResponse
): void {
  // console.log(req.headers['user-agent'])
  const ua: string = req.headers['user-agent'] ?? ''
  const uaReg: RegExp = /Mozilla\/5.0\s*\([^()]*?(Windows[^()]*?|Android[^()]*?|Mac OS[^()]*?|iPhone)(\)|;\s*([^()]*?)\))/
  const uaMatch: RegExpMatchArray | null = ua.match(uaReg)
  let device = 'unknown'
  if (uaMatch != null) {
    device = uaMatch[1].replaceAll(/NT./g, '').replaceAll('_', '.')
  }
  let ip = (req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? req.socket.remoteAddress) as string
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }
  const info = {
    ip,
    // ua: req.headers['user-agent'] ?? '',
    device
  }
  res.status(200).json(info)
}
