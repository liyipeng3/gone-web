import { PrismaClient } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
let prisma: PrismaClient = ({} as PrismaClient)

if (typeof window === 'undefined') {
  prisma = new PrismaClient()
}

export default prisma
