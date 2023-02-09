import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (typeof window === 'undefined') {
  prisma = new PrismaClient()
}

// @ts-expect-error
export default prisma
