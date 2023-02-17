import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (typeof window === 'undefined') {
  prisma = new PrismaClient()
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default prisma
