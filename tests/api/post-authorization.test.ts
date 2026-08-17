import { NextRequest, NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as createPostHandler } from '@/app/api/post/create/route'
import {
  DELETE as deletePostHandler
} from '@/app/api/post/[cid]/route'
import { POST as savePostHandler } from '@/app/api/post/[cid]/save/route'
import { POST as saveDraftHandler } from '@/app/api/post/[cid]/draft/route'
import { POST as publishPostHandler } from '@/app/api/post/[cid]/publish/route'

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  requireUser: vi.fn(),
  createPost: vi.fn(),
  updatePostByCid: vi.fn(),
  updateMetas: vi.fn(),
  publishPost: vi.fn(),
  getDraftPostByCid: vi.fn(),
  getPostSlugByCid: vi.fn(),
  getPostMids: vi.fn(),
  checkDraftSlugUnique: vi.fn(),
  updatePostCategory: vi.fn(),
  updatePostTags: vi.fn(),
  saveDraftAtomic: vi.fn(),
  deletePostByCid: vi.fn(),
  clearPostRelatedCaches: vi.fn()
}))

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: mocks.requireAdmin,
  requireUser: mocks.requireUser,
  isAuthResponse: (value: unknown) => value instanceof Response
}))

vi.mock('@/models/posts', () => ({
  createPost: mocks.createPost,
  updatePostByCid: mocks.updatePostByCid,
  updateMetas: mocks.updateMetas,
  publishPost: mocks.publishPost,
  getDraftPostByCid: mocks.getDraftPostByCid,
  getPostSlugByCid: mocks.getPostSlugByCid,
  getPostMids: mocks.getPostMids,
  checkDraftSlugUnique: mocks.checkDraftSlugUnique,
  updatePostCategory: mocks.updatePostCategory,
  updatePostTags: mocks.updatePostTags,
  saveDraftAtomic: mocks.saveDraftAtomic,
  deletePostByCid: mocks.deletePostByCid,
  DraftSlugConflictError: class DraftSlugConflictError extends Error {}
}))

vi.mock('@/models/posts/cache-utils', () => ({
  clearPostRelatedCaches: mocks.clearPostRelatedCaches
}))

const jsonRequest = (path: string, method: string, body?: unknown) => {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

describe('post management authorization', () => {
  beforeEach(() => {
    mocks.requireAdmin.mockResolvedValue(
      NextResponse.json({ error: '权限不足' }, { status: 403 })
    )
    mocks.requireUser.mockResolvedValue({
      id: '2',
      name: 'visitor',
      email: 'visitor@example.com'
    })
    mocks.createPost.mockResolvedValue({ cid: 1 })
    mocks.updatePostByCid.mockResolvedValue({ cid: 1 })
    mocks.updateMetas.mockResolvedValue([])
    mocks.publishPost.mockResolvedValue({ success: true })
    mocks.getDraftPostByCid.mockResolvedValue(null)
    mocks.getPostSlugByCid.mockResolvedValue('article')
    mocks.getPostMids.mockResolvedValue([])
    mocks.checkDraftSlugUnique.mockResolvedValue(true)
    mocks.updatePostCategory.mockResolvedValue({ success: true })
    mocks.updatePostTags.mockResolvedValue({ success: true })
    mocks.saveDraftAtomic.mockResolvedValue({ cid: 2, slug: 'draft', title: 'Draft', updatedAt: null })
    mocks.deletePostByCid.mockResolvedValue({ cid: 2 })
  })

  it.each([
    [
      'create',
      async () => await createPostHandler(jsonRequest('/api/post/create', 'POST'))
    ],
    [
      'save',
      async () => await savePostHandler(
        jsonRequest('/api/post/1/save', 'POST', {
          title: 'Article',
          slug: 'article',
          text: 'Body',
          category: 'default',
          tags: []
        }),
        { params: { cid: '1' } }
      )
    ],
    [
      'draft',
      async () => await saveDraftHandler(
        jsonRequest('/api/post/1/draft', 'POST', {
          title: 'Draft',
          slug: 'draft',
          text: 'Body',
          tags: []
        }),
        { params: { cid: '1' } }
      )
    ],
    [
      'publish',
      async () => await publishPostHandler(
        jsonRequest('/api/post/1/publish', 'POST'),
        { params: { cid: '1' } }
      )
    ],
    [
      'delete',
      async () => await deletePostHandler(
        jsonRequest('/api/post/1', 'DELETE'),
        { params: { cid: '1' } }
      )
    ]
  ])('rejects a non-admin before %s mutation', async (_name, invoke) => {
    const response = await invoke()

    expect(response.status).toBe(403)
  })

  it('binds a newly created post to the authenticated administrator', async () => {
    mocks.requireAdmin.mockResolvedValue({
      id: '7',
      name: 'admin',
      email: 'admin@example.com'
    })

    const response = await createPostHandler(
      jsonRequest('/api/post/create', 'POST')
    )

    expect(response.status).toBe(200)
    expect(mocks.createPost).toHaveBeenCalledWith({
      type: 'post',
      status: 'hidden',
      users: {
        connect: { uid: 7 }
      }
    })
  })
})
