// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { createHash } from 'crypto'
import { requireUser, isAuthResponse } from '@/lib/api-auth'

const MAX_QUERY_LENGTH = 5000

export async function GET (
  request: NextRequest
) {
  // 翻译接口仅供编辑器使用，需登录，避免匿名刷第三方 API 配额
  const auth = await requireUser()
  if (isAuthResponse(auth)) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: '缺少查询参数 q' }, { status: 400 })
  }

  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: '文本过长' }, { status: 400 })
  }

  try {
    const id = process.env.BAIDU_APP_ID
    const secret = process.env.BAIDU_APP_SECRET
    if (!id || !secret) {
      return NextResponse.json({ error: '翻译服务未配置' }, { status: 500 })
    }
    const salt = Date.now()

    // 百度翻译签名：MD5(appid + q + salt + 密钥)，appid 即 BAIDU_APP_ID
    const sign = createHash('md5').update(id + q + String(salt) + secret).digest('hex')
    const query = qs.stringify({
      q,
      from: 'zh',
      to: 'en',
      sign,
      salt,
      appid: id
    })
    const res = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${query}`).then(async res => await res.json())

    const dst = res?.trans_result?.[0]?.dst
    if (!dst) {
      return NextResponse.json({ error: '翻译失败' }, { status: 502 })
    }

    return NextResponse.json({ text: dst })
  } catch (error) {
    console.error('翻译请求失败:', error)
    return NextResponse.json({ error: '翻译服务异常' }, { status: 500 })
  }
}
