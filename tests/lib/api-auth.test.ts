import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isAdministrator, requireAdmin, parseId, requireSelf } from '@/lib/api-auth'

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findUnique: vi.fn()
}))

vi.mock('@/lib/session', () => ({
  getCurrentUser: mocks.getCurrentUser
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    users: {
      findUnique: mocks.findUnique
    }
  }
}))

describe('administrator authorization', () => {
  beforeEach(() => {
    mocks.getCurrentUser.mockResolvedValue({
      id: '7',
      name: 'admin',
      email: 'admin@example.com'
    })
    mocks.findUnique.mockResolvedValue({
      group: 'administrator'
    })
  })

  it('resolves the administrator by stable user id', async () => {
    const result = await requireAdmin()

    expect(result).toEqual(
      expect.objectContaining({
        id: '7',
        name: 'admin'
      })
    )
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { uid: 7 },
      select: { group: true }
    })
  })

  it('rejects a visitor account', async () => {
    mocks.findUnique.mockResolvedValue({ group: 'visitor' })

    const result = await requireAdmin()

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(403)
  })

  it('rejects malformed session ids without querying the database', async () => {
    const result = await isAdministrator({
      id: 'invalid',
      name: 'admin',
      email: 'admin@example.com'
    })

    expect(result).toBe(false)
    expect(mocks.findUnique).not.toHaveBeenCalled()
  })
})

describe('parseId', () => {
  it('parses a valid numeric id', () => {
    expect(parseId('42', '文章ID')).toBe(42)
  })

  it('returns a 400 response for a non-numeric id', async () => {
    const result = parseId('abc', '文章ID')

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(400)
    await expect((result as Response).json()).resolves.toEqual({ error: '无效的文章ID' })
  })
})

describe('requireSelf', () => {
  beforeEach(() => {
    mocks.getCurrentUser.mockResolvedValue({
      id: '7',
      name: 'user',
      email: 'user@example.com'
    })
  })

  it('returns the user when operating on their own resource', async () => {
    const result = await requireSelf('7')

    expect(result).toEqual(expect.objectContaining({ id: '7' }))
  })

  it('rejects an unauthenticated request with 401', async () => {
    mocks.getCurrentUser.mockResolvedValue(null)

    const result = await requireSelf('7')

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(401)
  })

  it('rejects operating on another user resource with 403', async () => {
    const result = await requireSelf('8')

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(403)
  })
})
