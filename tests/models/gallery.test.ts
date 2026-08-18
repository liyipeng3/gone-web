import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryTags
} from '@/models/gallery'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  delete: vi.fn(),
  findMany: vi.fn(),
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  delMany: vi.fn(),
  deleteFromOSS: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    gallery: {
      create: mocks.create,
      findUnique: mocks.findUnique,
      delete: mocks.delete,
      findMany: mocks.findMany
    }
  }
}))

vi.mock('@/lib/oss', () => ({
  deleteFromOSS: mocks.deleteFromOSS
}))

vi.mock('@/lib/cache', () => ({
  cacheService: {
    get: mocks.cacheGet,
    set: mocks.cacheSet,
    delMany: mocks.delMany
  },
  cacheKeys: {
    galleryTags: 'gallery:tags',
    galleryCategories: 'gallery:categories',
    galleryStats: 'gallery:stats'
  }
}))

describe('createGalleryItem', () => {
  beforeEach(() => {
    mocks.create.mockResolvedValue({ gid: 1 })
  })

  it('serializes tags array to a JSON string', async () => {
    await createGalleryItem({ imagePath: 'a.jpg', tags: ['x', 'y'] })
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tags: JSON.stringify(['x', 'y']) })
    })
  })

  it('stores null tags when none provided', async () => {
    await createGalleryItem({ imagePath: 'a.jpg' })
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tags: null })
    })
  })
})

describe('getGalleryTags', () => {
  beforeEach(() => {
    mocks.cacheGet.mockReturnValue(undefined)
  })

  it('parses and de-duplicates tags across rows, skipping malformed JSON', async () => {
    mocks.findMany.mockResolvedValue([
      { tags: JSON.stringify(['travel', 'city']) },
      { tags: JSON.stringify(['city', 'night']) },
      { tags: 'not-json' }
    ])

    const tags = await getGalleryTags()

    expect(tags.sort()).toEqual(['city', 'night', 'travel'])
    expect(mocks.cacheSet).toHaveBeenCalledWith('gallery:tags', tags)
  })

  it('returns the cached value without querying', async () => {
    mocks.cacheGet.mockReturnValue(['cached'])
    const tags = await getGalleryTags()
    expect(tags).toEqual(['cached'])
    expect(mocks.findMany).not.toHaveBeenCalled()
  })
})

describe('deleteGalleryItem', () => {
  it('throws when the gallery item does not exist', async () => {
    mocks.findUnique.mockResolvedValue(null)
    await expect(deleteGalleryItem(404)).rejects.toThrow('相册项不存在')
    expect(mocks.delete).not.toHaveBeenCalled()
  })

  it('deletes the DB record and invalidates aggregate caches', async () => {
    mocks.findUnique.mockResolvedValue({ gid: 1, imagePath: 'a.jpg', thumbnailPath: null })
    mocks.delete.mockResolvedValue({ gid: 1 })

    await deleteGalleryItem(1)

    expect(mocks.delete).toHaveBeenCalledWith({ where: { gid: 1 } })
    expect(mocks.delMany).toHaveBeenCalledWith([
      'gallery:tags',
      'gallery:categories',
      'gallery:stats'
    ])
  })
})
