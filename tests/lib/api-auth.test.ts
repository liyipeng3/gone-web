import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isAdministrator, requireAdmin } from '@/lib/api-auth'

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
