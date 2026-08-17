import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPostBySlug } from '@/models/posts/basic-operations'

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  getPostFromCache: vi.fn(),
  setPostCache: vi.fn(),
  clearPostRelatedCaches: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    posts: {
      findUnique: mocks.findUnique
    }
  }
}))

vi.mock('@/models/posts/cache-utils', () => ({
  getPostFromCache: mocks.getPostFromCache,
  setPostCache: mocks.setPostCache,
  clearPostRelatedCaches: mocks.clearPostRelatedCaches
}))

describe('public post reads', () => {
  beforeEach(() => {
    mocks.getPostFromCache.mockReturnValue(null)
    mocks.findUnique.mockResolvedValue(null)
  })

  it('only queries published posts by slug', async () => {
    await getPostBySlug('article')

    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'article',
          status: 'publish'
        }
      })
    )
  })
})
