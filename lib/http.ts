'use client'

const request = async (url: string, options: RequestInit) => {
  return await (fetch(url, options).then(async res => {
    if (res.ok) {
      return await res.json()
    } else {
      throw new Error(String(await res.text()))
    }
  }))
}

const post = async (url: string, body?: any) => {
  return await request(url, {
    method: 'post',
    body: body ? JSON.stringify(body) : '{}'
  })
}

const del = async (url: string) => {
  return await request(url, { method: 'delete' })
}

const get = async (url: string, params?: Record<string, any>) => {
  if (params) {
    const searchParams = new URLSearchParams()
    for (const key in params) {
      searchParams.append(key, params[key])
    }
    url += '?' + searchParams.toString()
  }
  return await request(url, { method: 'get' })
}

const http = {
  request,
  post,
  del,
  get
}

export default http
