import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveDraftAtomic, DraftSlugConflictError } from '@/models/posts/relationship-operations'

const mocks = vi.hoisted(() => {
  const tx = {
    posts: {
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findUniqueOrThrow: vi.fn()
    },
    relationships: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      create: vi.fn()
    },
    metas: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn()
    }
  }
  return {
    tx,
    transaction: vi.fn(),
    clearPostRelatedCaches: vi.fn(),
    cacheDeleteByPrefix: vi.fn(),
    cacheDelete: vi.fn()
  }
})

vi.mock('@/lib/prisma', () => ({
  default: { $transaction: mocks.transaction }
}))

vi.mock('@/models/posts/cache-utils', () => ({
  clearPostRelatedCaches: mocks.clearPostRelatedCaches
}))

vi.mock('@/lib/cache', () => ({
  cacheService: { delByPrefix: mocks.cacheDeleteByPrefix, del: mocks.cacheDelete },
  cacheKeys: { tags: 'tags', categories: 'categories' }
}))

const existingDraft = (tags: string[], category?: string) => ({
  cid: 20,
  slug: '@my-post',
  title: 'Draft',
  relationships: [
    ...tags.map(slug => ({ metas: { mid: Math.random(), type: 'tag', slug } })),
    ...(category ? [{ metas: { mid: 999, type: 'category', slug: category } }] : [])
  ]
})

describe('saveDraftAtomic', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (cb: (tx: typeof mocks.tx) => Promise<unknown>) => await cb(mocks.tx)
    )
    // 通用默认返回
    mocks.tx.posts.count.mockResolvedValue(0)
    mocks.tx.posts.update.mockResolvedValue({ cid: 20 })
    mocks.tx.posts.create.mockResolvedValue({ cid: 20 })
    mocks.tx.posts.findUniqueOrThrow.mockResolvedValue({
      cid: 20, slug: '@my-post', title: 'Draft', updatedAt: new Date('2025-01-01T00:00:00Z')
    })
    mocks.tx.relationships.findMany.mockResolvedValue([])
    mocks.tx.relationships.findFirst.mockResolvedValue(null)
    mocks.tx.relationships.deleteMany.mockResolvedValue({ count: 0 })
    mocks.tx.relationships.createMany.mockResolvedValue({ count: 0 })
    mocks.tx.relationships.create.mockResolvedValue({})
    mocks.tx.metas.findMany.mockResolvedValue([])
    mocks.tx.metas.findFirst.mockResolvedValue(null)
    mocks.tx.metas.updateMany.mockResolvedValue({ count: 0 })
    mocks.tx.metas.update.mockResolvedValue({})
    mocks.tx.metas.create.mockResolvedValue({ mid: 1 })
  })

  it('首次创建草稿：走 create 且不拷贝父文章关系', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(null) // 无既有草稿

    await saveDraftAtomic(10, { slug: 'my-post', title: 'T', text: 'body', tags: [] }, 7)

    expect(mocks.tx.posts.create).toHaveBeenCalledTimes(1)
    const createArg = mocks.tx.posts.create.mock.calls[0][0]
    // 不应包含 relationships 拷贝
    expect(createArg.data.relationships).toBeUndefined()
    expect(createArg.data).toMatchObject({
      slug: '@my-post',
      type: 'post_draft',
      status: 'hidden',
      parent: 10,
      users: { connect: { uid: 7 } }
    })
  })

  it('slug 未加 @ 前缀时自动补上', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(null)
    const res = await saveDraftAtomic(10, { slug: 'hello', tags: [] }, 7)
    expect(mocks.tx.posts.create.mock.calls[0][0].data.slug).toBe('@hello')
    // 返回给前端的 slug 去掉 @ 前缀
    expect(res.slug).toBe('my-post')
  })

  it('已存在草稿且 tags 未变：不重写标签关系', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(existingDraft(['a', 'b'], 'cat'))

    await saveDraftAtomic(10, { slug: 'my-post', tags: ['b', 'a'], category: 'cat' }, 7)

    // tags 顺序不同但内容一致 → 不应触发标签关系的 findMany（syncTagsTx 的首个查询）
    expect(mocks.tx.relationships.findMany).not.toHaveBeenCalled()
    // category 也未变 → 不触发分类关系查询
    expect(mocks.tx.relationships.findFirst).not.toHaveBeenCalled()
  })

  it('已存在草稿且 tags 变化：重写标签关系', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(existingDraft(['a'], 'cat'))

    await saveDraftAtomic(10, { slug: 'my-post', tags: ['a', 'new'], category: 'cat' }, 7)

    // tags 变化 → syncTagsTx 执行，会查询当前标签关系
    expect(mocks.tx.relationships.findMany).toHaveBeenCalled()
  })

  it('已存在草稿且 category 变化：重写分类关系', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(existingDraft(['a'], 'old-cat'))

    await saveDraftAtomic(10, { slug: 'my-post', tags: ['a'], category: 'new-cat' }, 7)

    // category 变化 → syncCategoryTx 执行
    expect(mocks.tx.relationships.findFirst).toHaveBeenCalled()
    // category 变化 → 失效分类列表缓存
    expect(mocks.cacheDelete).toHaveBeenCalledWith('categories')
  })

  it('slug 冲突时抛 DraftSlugConflictError', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(null)
    mocks.tx.posts.count.mockResolvedValue(1) // 存在同 slug 的其他文章

    await expect(
      saveDraftAtomic(10, { slug: 'dup', tags: [] }, 7)
    ).rejects.toBeInstanceOf(DraftSlugConflictError)
  })

  it('内容变化时事务提交后失效缓存', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(existingDraft(['a'], 'cat'))

    await saveDraftAtomic(10, { slug: 'my-post', tags: ['a', 'new'], category: 'cat' }, 7)

    expect(mocks.clearPostRelatedCaches).toHaveBeenCalledWith({ cid: 20 })
    expect(mocks.cacheDeleteByPrefix).toHaveBeenCalledWith('tags')
  })
})
