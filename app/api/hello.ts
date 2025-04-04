// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// interface Data {
//   name: string
// }

// export default function handler (
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
//
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // console.log(req.headers['user-agent'])
  const ua: string = req.headers['user-agent'] ?? ''
  const uaReg: RegExp = /Mozilla\/5\.0\s*\(([^()]*(Windows|Android|Mac OS|iPhone)[^()]*?)(?:\)|;\s*([^()]*?)\))/
  const uaMatch: RegExpMatchArray | null = ua.match(uaReg)
  let device = 'unknown'
  if (uaMatch != null) {
    device = uaMatch[1].replaceAll(/NT./g, '').replaceAll('_', '.')
  }
  let ip = (req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? req.socket.remoteAddress) as string
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }
  const localIps = ['0.0.0.0', '::1', '::ffff:', '172', '192', '127', '10']
  if (localIps.some(localIp => ip.startsWith(localIp))) {
    ip = 'local'
  }
  let city = 'unknown'
  let country = 'unknown'
  if (ip !== 'local') {
    try {
      const data = await fetch(`http://ip-api.com/json/${ip}?fields=25&lang=zh-CN`).then(async res => await res.json())
      // console.log(data)
      city = data.city
      country = data.country
    } catch (e) {
      console.log(e)
    }
  }

  const info = {
    ip,
    // ua: req.headers['user-agent'] ?? '',
    device,
    city,
    country
  }
  res.status(200).json(info)
}
