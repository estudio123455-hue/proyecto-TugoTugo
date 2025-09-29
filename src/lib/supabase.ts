import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANONKEY || ''

// Create a fallback client for build time when env vars might not be available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null

// Types for our database
export interface User {
  id: string
  email: string
  name?: string
  role: 'CUSTOMER' | 'ESTABLISHMENT' | 'ADMIN'
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface Establishment {
  id: string
  user_id: string
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}
