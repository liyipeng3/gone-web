import NodeCache from 'node-cache'

// 缓存配置
const DEFAULT_TTL = 600 // 默认10分钟
const CACHE_CHECK_PERIOD = 120 // 每2分钟检查过期缓存

// 创建单例缓存实例
const globalCache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CACHE_CHECK_PERIOD,
  useClones: false // 对于大型对象，禁用克隆可以提高性能
})

// 缓存键前缀，避免命名冲突
export const cacheKeys = {
  recentComments: 'comments:recent',
  postList: 'posts:list',
  hotList: 'posts:hot',
  links: 'links',
  tags: 'tags',
  categories: 'categories',
  archive: 'posts:archive',
  post: 'posts:single'
}

// 缓存服务
export const cacheService = {
  // 设置缓存，可以指定自定义过期时间
  set: (key: string, data: any, ttl?: number) => {
    if (ttl !== undefined) {
      globalCache.set(key, data, ttl)
    } else {
      globalCache.set(key, data)
    }
  },
  // 获取缓存
  get: <T>(key: string): T | undefined => {
    return globalCache.get<T>(key)
  },
  // 删除单个缓存
  del: (key: string) => {
    globalCache.del(key)
  },
  // 删除多个缓存
  delMany: (keys: string[]) => {
    globalCache.del(keys)
  },
  // 按前缀删除缓存
  delByPrefix: (prefix: string) => {
    const keys = globalCache.keys().filter(key => key.startsWith(prefix))
    globalCache.del(keys)
  },
  // 清除所有缓存
  flush: () => {
    globalCache.flushAll()
  },
  // 获取所有缓存键
  getAllKeys: (): string[] => {
    return globalCache.keys()
  },
  // 缓存键生成器
  keys: cacheKeys
}
