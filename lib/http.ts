'use client'

interface HttpError extends Error {
  status?: number
  data?: any
}

const request = async <T>(url: string, options: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    if (!response.ok) {
      const error: HttpError = new Error(data.message || 'API请求失败')
      error.status = response.status
      error.data = data
      throw error
    }
    return data as T
  } catch (error) {
    if (error instanceof Error) {
      console.error(`请求失败: ${url}`, error)
    }
    throw error
  }
}

const post = async <T>(url: string, body?: any): Promise<T> => {
  return await request<T>(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : '{}'
  })
}

const del = async <T>(url: string): Promise<T> => {
  return await request<T>(url, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const get = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  if (params) {
    const searchParams = new URLSearchParams()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, String(params[key]))
      }
    }
    url += '?' + searchParams.toString()
  }
  return await request<T>(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const http = {
  request,
  post,
  del,
  get
}

export default http
