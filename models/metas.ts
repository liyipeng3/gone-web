import prisma from '@/lib/prisma'
import { cacheService, cacheKeys } from '@/lib/cache'

export const getCategoryList = async () => {
  const cachedData = cacheService.get(cacheKeys.categories)

  if (cachedData) {
    return cachedData
  }

  const categoryList = await prisma.metas.findMany({
    select: {
      name: true,
      slug: true
    },
    where: {
      type: 'category'
    },
    orderBy: {
      order: 'asc'
    }
  })

  // 分类为低频变更数据，缓存以减少每页 Header 请求带来的重复查询；
  // 新建分类时在 syncCategoryTx 提交后失效
  cacheService.set(cacheKeys.categories, categoryList)

  return categoryList
}
