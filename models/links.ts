import prisma from '@/lib/prisma'
import NodeCache from 'node-cache'

// 创建缓存实例，设置默认过期时间为1小时
const cache = new NodeCache({ stdTTL: 3600 })

export const getLinks = async (limit?: number) => {
  // 使用缓存键
  const cacheKey = `links_${limit ?? 'all'}`
  const cachedData = cache.get(cacheKey)

  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData as Array<{
      lid: number
      name: string | null
      url: string | null
      sort: string | null
      image: string | null
      description: string | null
      user: string | null
      order: number | null
    }>
  }

  const links = await prisma.links.findMany({
    orderBy: {
      order: 'asc'
    },
    ...(limit ? { take: limit } : {})
  })

  // 缓存结果
  cache.set(cacheKey, links)

  return links
}
