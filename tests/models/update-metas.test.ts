import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateMetas } from '@/models/posts/relationship-operations'

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  deleteMany: vi.fn(),
  metaFindFirst: vi.fn(),
  metaCreate: vi.fn(),
  createMany: vi.fn(),
  delByPrefix: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mocks.transaction
  }
}))

vi.mock('@/lib/cache', () => ({
  cacheService: { delByPrefix: mocks.delByPrefix },
  cacheKeys: { tags: 'tags' }
}))

vi.mock('@/models/posts/cache-utils', () => ({
  clearPostRelatedCaches: vi.fn()
}))

// 构造一个模拟事务客户端，并让 $transaction 以它执行回调
const buildTx = () => ({
  relationships: {
    deleteMany: mocks.deleteMany,
    createMany: mocks.createMany
  },
  metas: {
    findFirst: mocks.metaFindFirst,
    create: mocks.metaCreate
  }
})

describe('updateMetas transaction', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => cb(buildTx()))
    mocks.deleteMany.mockResolvedValue({ count: 0 })
    mocks.createMany.mockResolvedValue({ count: 0 })
  })

  it('runs all writes inside a single $transaction', async () => {
    mocks.metaFindFirst.mockResolvedValue({ mid: 1 })
    await updateMetas(5, 'tech', [])
    expect(mocks.transaction).toHaveBeenCalledTimes(1)
  })

  it('clears old relationships before inserting new ones', async () => {
    mocks.metaFindFirst.mockResolvedValue({ mid: 1 })
    await updateMetas(5, 'tech', [])
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { posts: { cid: 5 } } })
  })

  it('creates missing tags and batch-inserts tag + category relationships', async () => {
    // category 命中 mid=1；tag "new" 未命中需新建 mid=2；tag "old" 命中 mid=3
    mocks.metaFindFirst.mockImplementation(async ({ where }: { where: { slug: string, type: string } }) => {
      if (where.type === 'category' && where.slug === 'tech') return { mid: 1 }
      if (where.type === 'tag' && where.slug === 'old') return { mid: 3 }
      return null
    })
    mocks.metaCreate.mockResolvedValue({ mid: 2 })

    await updateMetas(5, 'tech', ['new', 'old'])

    // 新标签被创建
    expect(mocks.metaCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'new', type: 'tag' }) })
    )
    // 关系批量插入：两个 tag + 一个 category
    expect(mocks.createMany).toHaveBeenCalledWith({
      data: [
        { cid: 5, mid: 2 },
        { cid: 5, mid: 3 },
        { cid: 5, mid: 1 }
      ]
    })
    // 标签云缓存被失效
    expect(mocks.delByPrefix).toHaveBeenCalledWith('tags')
  })

  it('skips the category relationship when the category meta is missing', async () => {
    mocks.metaFindFirst.mockResolvedValue(null)

    await updateMetas(5, 'missing', [])

    // 没有任何有效 mid，则不应调用 createMany
    expect(mocks.createMany).not.toHaveBeenCalled()
  })
})
