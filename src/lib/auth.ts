import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
      }
      if (account?.provider === 'google') {
        // For Google OAuth, set default role if not exists
        if (!token.role) {
          token.role = 'CUSTOMER'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Create or update user in database for Google OAuth
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || profile?.name || '',
                role: 'CUSTOMER',
                image: user.image,
              },
            })
          }
          return true
        } catch (error) {
          console.error('Error creating Google user:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/oauth-callback', // Redirect here after OAuth signup
  },
}
