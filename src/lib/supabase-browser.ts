'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseBrowserInstance: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (supabaseBrowserInstance) return supabaseBrowserInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Supabase credentials not configured')
  }

  supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseBrowserInstance
}
