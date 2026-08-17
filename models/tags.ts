import prisma from '@/lib/prisma'
import { cacheService, cacheKeys } from '@/lib/cache'

export const getTags = async (limit: number = 30) => {
  // 使用全局缓存服务，key 带前缀，便于标签变更时统一失效
  const cacheKey = `${cacheKeys.tags}:${limit}`
  const cachedData = cacheService.get(cacheKey)

  // 如果缓存中有数据，直接返回
  if (cachedData) {
    return cachedData
  }

  const tags = await prisma.metas.findMany({
    where: { type: 'tag' },
    orderBy: { count: 'desc' },
    take: limit
  })

  // 缓存结果
  cacheService.set(cacheKey, tags)

  return tags
}
