import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { type JWT } from 'next-auth/jwt'

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'username'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize (credentials, req) {
        // console.log('===', await bcryptjs.genSalt(10))
        const user = await prisma.users.findUnique({
          where: {
            username: credentials?.username,
            password: bcryptjs.hashSync(credentials?.password as string, process.env.SALT as string)
          }
        })
        // If no error and we have user data, return it
        if (user !== null) {
          return {
            id: user.uid,
            name: user.username,
            email: user.mail
            // image: '/favicon.ico'
          } as unknown as JWT
        }
        // Return null if user data could not be retrieved
        return null
      }
    })
  ],
  callbacks: {
    async session ({ token, session }) {
      if (token !== null) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.image as string
      }

      return session
    },
    async jwt ({ token, user }) {
      const dbUser = await prisma.users.findFirst({
        where: {
          username: token.name
        }
      })

      if (dbUser == null) {
        if (user !== null) {
          token.id = user?.id
        }
        return token
      }

      return {
        id: dbUser.uid,
        name: dbUser.username,
        email: dbUser.mail,
        picture: dbUser.screenName
      } as unknown as JWT
    }
  }
}
