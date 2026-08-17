import { beforeEach, describe, expect, it, vi } from 'vitest'
import { publishPost } from '@/models/posts/relationship-operations'

const mocks = vi.hoisted(() => {
  const tx = {
    posts: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    relationships: {
      deleteMany: vi.fn(),
      updateMany: vi.fn()
    }
  }

  return {
    tx,
    transaction: vi.fn(),
    getDraftPostByCid: vi.fn(),
    clearPostRelatedCaches: vi.fn(),
    cacheDeleteByPrefix: vi.fn()
  }
})

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mocks.transaction
  }
}))

vi.mock('@/models/posts/basic-operations', () => ({
  getDraftPostByCid: mocks.getDraftPostByCid
}))

vi.mock('@/models/posts/cache-utils', () => ({
  clearPostRelatedCaches: mocks.clearPostRelatedCaches
}))

vi.mock('@/lib/cache', () => ({
  cacheService: {
    delByPrefix: mocks.cacheDeleteByPrefix
  },
  cacheKeys: {
    tags: 'tags'
  }
}))

const originalPost = {
  cid: 10,
  uid: 1,
  title: 'Published',
  slug: 'published',
  text: 'Old body',
  order: 0,
  type: 'post',
  status: 'publish',
  password: null,
  commentsNum: 2,
  allowComment: '1',
  parent: 0,
  viewsNum: 20,
  likesNum: 3,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z')
}

const draftPost = {
  ...originalPost,
  cid: 20,
  title: 'Updated',
  slug: '@updated',
  text: 'New body',
  type: 'post_draft',
  status: 'hidden',
  parent: 10
}

describe('publishPost', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => {
        return await callback(mocks.tx)
      }
    )
    mocks.tx.posts.findUnique.mockResolvedValue(originalPost)
    mocks.tx.posts.findFirst.mockResolvedValue(draftPost)
    mocks.tx.posts.update.mockResolvedValue({
      ...originalPost,
      title: draftPost.title,
      slug: 'updated',
      text: draftPost.text
    })
    mocks.tx.posts.delete.mockResolvedValue(draftPost)
    mocks.tx.relationships.deleteMany.mockResolvedValue({ count: 1 })
    mocks.tx.relationships.updateMany.mockResolvedValue({ count: 1 })
    mocks.getDraftPostByCid.mockResolvedValue(draftPost)
  })

  it('publishes a draft without deleting the original post', async () => {
    await publishPost(10)

    expect(mocks.tx.posts.delete).not.toHaveBeenCalledWith({
      where: { cid: 10 }
    })
    expect(mocks.tx.posts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cid: 10 },
        data: expect.objectContaining({
          title: 'Updated',
          slug: 'updated',
          text: 'New body',
          status: 'publish',
          type: 'post'
        })
      })
    )
    expect(mocks.tx.relationships.deleteMany).toHaveBeenCalledWith({
      where: { cid: 10 }
    })
    expect(mocks.tx.relationships.updateMany).toHaveBeenCalledWith({
      where: { cid: 20 },
      data: { cid: 10 }
    })
    expect(mocks.tx.posts.delete).toHaveBeenCalledWith({
      where: { cid: 20 }
    })
    expect(mocks.clearPostRelatedCaches).toHaveBeenCalledWith({
      cid: 10,
      slugs: ['published', 'updated']
    })
  })

  it('publishes in place when no draft exists', async () => {
    mocks.tx.posts.findFirst.mockResolvedValue(null)
    mocks.getDraftPostByCid.mockResolvedValue(null)

    await publishPost(10)

    expect(mocks.tx.posts.update).toHaveBeenCalledWith({
      where: { cid: 10 },
      data: { status: 'publish', type: 'post' }
    })
    expect(mocks.tx.posts.delete).not.toHaveBeenCalled()
  })
})
