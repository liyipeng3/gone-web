import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET as getGalleryListHandler } from '@/app/api/gallery/route'
import { GET as getGalleryItemHandler } from '@/app/api/gallery/[gid]/route'

const mocks = vi.hoisted(() => ({
  getGalleryList: vi.fn(),
  getGalleryById: vi.fn(),
  createGalleryItem: vi.fn(),
  updateGalleryItem: vi.fn(),
  deleteGalleryItem: vi.fn(),
  getCurrentUser: vi.fn(),
  requireAdmin: vi.fn()
}))

vi.mock('@/models/gallery', () => ({
  getGalleryList: mocks.getGalleryList,
  getGalleryById: mocks.getGalleryById,
  createGalleryItem: mocks.createGalleryItem,
  updateGalleryItem: mocks.updateGalleryItem,
  deleteGalleryItem: mocks.deleteGalleryItem
}))

vi.mock('@/lib/session', () => ({
  getCurrentUser: mocks.getCurrentUser
}))

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthResponse: (value: unknown) => value instanceof Response
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    users: {
      findUnique: vi.fn()
    }
  }
}))

describe('public gallery routes', () => {
  beforeEach(() => {
    mocks.getGalleryList.mockResolvedValue({ items: [], total: 0 })
    mocks.getGalleryById.mockResolvedValue(null)
  })

  it('ignores isPublic=false on the public list route', async () => {
    const request = new NextRequest(
      'http://localhost/api/gallery?isPublic=false'
    )

    const response = await getGalleryListHandler(request)

    expect(response.status).toBe(200)
    expect(mocks.getGalleryList).toHaveBeenCalledWith(
      expect.objectContaining({ isPublic: true })
    )
  })

  it('clamps pagination and rejects unsupported ordering values', async () => {
    const request = new NextRequest(
      'http://localhost/api/gallery?limit=9999&offset=-1&orderBy=invalid&orderDirection=invalid'
    )

    const response = await getGalleryListHandler(request)

    expect(response.status).toBe(200)
    expect(mocks.getGalleryList).toHaveBeenCalledWith({
      category: undefined,
      tag: undefined,
      limit: 100,
      offset: 0,
      orderBy: 'createdAt',
      orderDirection: 'desc',
      isPublic: true
    })
  })

  it('returns 404 for a private gallery item', async () => {
    mocks.getGalleryById.mockResolvedValue({
      gid: 1,
      imagePath: 'https://example.com/private.jpg',
      isPublic: false
    })

    const response = await getGalleryItemHandler(
      new NextRequest('http://localhost/api/gallery/1'),
      { params: { gid: '1' } }
    )

    expect(response.status).toBe(404)
  })
})
