import { createClient } from '@supabase/supabase-js'

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'bollettai',
    },
  })
}

export const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service credentials not configured')
  }

  return createClient(supabaseUrl, serviceKey, {
    db: {
      schema: 'bollettai',
    },
  })
}

export interface BollettaAnalysis {
  id: string
  user_id: string
  filename: string
  fornitore: string | null
  pod: string | null
  potenza_impegnata: string | null
  periodo_fatturazione: string | null
  consumo_totale_kwh: number | null
  consumo_f1: number | null
  consumo_f2: number | null
  consumo_f3: number | null
  costo_energia: number | null
  oneri_sistema: number | null
  imposte: number | null
  totale: number | null
  valutazione: 'promossa' | 'bocciata' | 'sufficiente' | null
  problemi: string[] | null
  suggerimenti: string[] | null
  risparmio_potenziale: number | null
  raw_response: Record<string, unknown> | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  vat_number: string | null
  phone: string | null
  tier: 'free' | 'base' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  analyses_this_month: number
  created_at: string
  updated_at: string
}
