import prisma from '@/lib/prisma'
import { type links } from '@prisma/client'
import { cacheService, cacheKeys } from '@/lib/cache'

export const getLinks = async (limit?: number): Promise<links[]> => {
  // 使用全局缓存服务，key 带前缀
  const cacheKey = `${cacheKeys.links}:${limit ?? 'all'}`
  const cachedData = cacheService.get<links[]>(cacheKey)

  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData
  }

  const links = await prisma.links.findMany({
    orderBy: {
      order: 'asc'
    },
    ...(limit ? { take: limit } : {})
  })

  // 缓存结果（友链变化频率低，保留 1 小时 TTL）
  cacheService.set(cacheKey, links, 3600)

  return links
}
