import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
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
          console.log('❌ [Auth] Missing credentials')
          return null
        }

        console.log('🔐 [Auth] Attempting login for:', credentials.email)

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          console.log('❌ [Auth] User not found:', credentials.email)
          return null
        }

        if (!user.password) {
          console.log('❌ [Auth] User has no password (OAuth user?):', credentials.email)
          return null
        }

        console.log('🔍 [Auth] User found, checking password...')

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ [Auth] Invalid password for:', credentials.email)
          return null
        }

        console.log('✅ [Auth] Password valid for:', credentials.email, 'Role:', user.role)

        // Si es ADMIN, marcar como verificado automáticamente
        if (user.role === 'ADMIN') {
          // Update login count and last activity
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginCount: { increment: 1 },
              lastActivity: new Date(),
            },
          })

          // 🧠 ANÁLISIS AUTOMÁTICO DE COMPORTAMIENTO
          // Ejecutar análisis cada 5 logins para no sobrecargar
          if (user.loginCount % 5 === 0) {
            try {
              console.log(`🧠 [Auto-Behavior] Triggering behavior analysis for user ${user.id}`)
              
              // Ejecutar análisis directo sin necesidad de HTTP request
              // El análisis se ejecutará cuando el usuario use la app
              console.log(`📊 [Auto-Behavior] User ${user.id} is due for behavior analysis on next app usage`)
            } catch (error) {
              console.error('❌ [Auto-Behavior] Error triggering analysis:', error)
            }
          }
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
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
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // If URL is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If URL is from same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // For OAuth callbacks, always redirect to home
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/`
      }
      
      // Default: redirect to home page
      return `${baseUrl}/`
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Create or update user in database for Google OAuth
        try {
          console.log('🔐 [Google OAuth] User signing in:', user.email)
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          
          if (!existingUser) {
            // Clean name from any verification codes
            const cleanName = (user.name || profile?.name || '').replace(/^VERIFY:\d+:\d+:/, '')
            
            // Default role is CUSTOMER
            // Note: Account type will be set to ESTABLISHMENT later if user creates a restaurant
            console.log('✨ [Google OAuth] Creating new user:', cleanName)
            
            await prisma.user.create({
              data: {
                email: user.email!,
                name: cleanName,
                role: 'CUSTOMER', // Always start as CUSTOMER
                image: user.image,
              },
            })
            
            console.log('✅ [Google OAuth] User created successfully')
          } else {
            console.log('ℹ️ [Google OAuth] User already exists')
            
            // If user exists but has verification codes in name, clean it
            if (existingUser.name?.startsWith('VERIFY:')) {
              const cleanName = existingUser.name.replace(/^VERIFY:\d+:\d+:/, '')
              await prisma.user.update({
                where: { email: user.email! },
                data: { name: cleanName },
              })
            }
          }
          return true
        } catch (error) {
          console.error('❌ [Google OAuth] Error:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth', // Redirect to auth page on error
  },
}