'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Handle email confirmation
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not available')

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resendConfirmation = async (email: string) => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
