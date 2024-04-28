import { NextResponse } from 'next/server'
import { random } from 'lodash-es'

let cache: any

void (async () => {
  cache = await fetch('https://sentences-bundle.hitokoto.cn/sentences/d.json').then(async res => await res.json())
})()

export const GET = async () => {
  let data
  if (cache) {
    data = cache
  } else {
    data = await fetch('https://sentences-bundle.hitokoto.cn/sentences/d.json').then(async res => await res.json())
  }

  return NextResponse.json(data[random(0, data.length - 1)])
}
