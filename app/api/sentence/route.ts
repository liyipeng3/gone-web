import { NextResponse } from 'next/server'
import { random } from 'lodash-es'

// hitokoto 句子结构（仅声明用到的字段）
interface Sentence {
  hitokoto: string
  from: string
}

const SENTENCES_URL = 'https://sentences-bundle.hitokoto.cn/sentences/d.json'

let cache: Sentence[] | undefined

void (async () => {
  cache = await fetch(SENTENCES_URL).then(async res => await res.json())
})()

export const dynamic = 'force-dynamic' // defaults to auto

export const GET = async () => {
  const data: Sentence[] = cache ?? await fetch(SENTENCES_URL).then(async res => await res.json())

  return NextResponse.json(data[random(0, data.length - 1)])
}
