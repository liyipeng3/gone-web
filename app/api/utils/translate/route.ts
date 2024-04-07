// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { createHash } from 'crypto'

export async function GET (
  request: NextRequest
) {
  const id = process.env.BAIDU_APP_ID
  const secret = process.env.BAIDU_APP_SECRET
  const salt = Date.now()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  const sign = createHash('md5').update(`${id}${q}${salt}${secret}`).digest('hex')
  const query = qs.stringify({
    q,
    from: 'zh',
    to: 'en',
    sign,
    salt,
    appid: id
  })
  const res = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${query}`).then(async res => await res.json())
  // console.log(res)

  return NextResponse.json({ text: res.trans_result[0].dst })
}
