import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createComment, updateComment } from '@/models/comments'

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delByPrefix: vi.fn()
}))

// React.cache 在 node 测试环境下不可用，直接透传原函数
vi.mock('react', () => ({
  cache: <T,>(fn: T) => fn
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    comments: {
      findFirst: mocks.findFirst,
      create: mocks.create,
      update: mocks.update
    }
  }
}))

vi.mock('@/lib/cache', () => ({
  cacheService: { delByPrefix: mocks.delByPrefix },
  cacheKeys: { recentComments: 'comments:recent' }
}))

const baseData = {
  author: 'Alice',
  text: 'hello',
  email: 'alice@example.com',
  url: '',
  agent: 'jest',
  ip: '127.0.0.1'
}

describe('createComment moderation status', () => {
  beforeEach(() => {
    mocks.create.mockImplementation(async ({ data }) => ({ coid: 1, ...data }))
  })

  it('marks a first-time email as waiting for moderation', async () => {
    mocks.findFirst.mockResolvedValue(null)

    await createComment(10, 0, baseData)

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cid: 10, parent: 0, status: 'waiting' })
      })
    )
  })

  it('auto-approves when the same email already has an approved comment', async () => {
    mocks.findFirst.mockResolvedValue({ coid: 99, email: baseData.email, status: 'approved' })

    await createComment(10, 0, baseData)

    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { email: baseData.email, status: 'approved' }
    })
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'approved' })
      })
    )
  })

  it('invalidates the recent-comments cache after creating', async () => {
    mocks.findFirst.mockResolvedValue(null)

    await createComment(10, 0, baseData)

    expect(mocks.delByPrefix).toHaveBeenCalledWith('comments:recent')
  })
})

describe('updateComment', () => {
  it('invalidates the recent-comments cache after updating', async () => {
    mocks.update.mockResolvedValue({ coid: 1 })

    await updateComment(1, { status: 'approved' })

    expect(mocks.update).toHaveBeenCalledWith({
      where: { coid: 1 },
      data: { status: 'approved' }
    })
    expect(mocks.delByPrefix).toHaveBeenCalledWith('comments:recent')
  })
})
