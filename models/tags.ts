import prisma from '@/lib/prisma'
import NodeCache from 'node-cache'

// 创建缓存实例，设置默认过期时间为10分钟
const cache = new NodeCache({ stdTTL: 600 })

export const getTags = async (limit: number = 30) => {
  // 使用缓存键
  const cacheKey = `tags_${limit}`
  const cachedData = cache.get(cacheKey)
  
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
  cache.set(cacheKey, tags)
  
  return tags
}
