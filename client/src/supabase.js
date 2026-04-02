import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

let supabase = null

const configStatus = {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
}

const hasConfig = configStatus.hasUrl && configStatus.hasAnonKey

if (hasConfig) {
  try {
    const existing = typeof window !== 'undefined' ? window._supabaseClient : null

    supabase = existing || createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'supabase.auth.token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })

    if (typeof window !== 'undefined') {
      window._supabaseClient = supabase
    }
  } catch (err) {
    console.error('Supabase initialization error:', err.message)
  }
} else {
  console.error('❌ Supabase configuration incomplete:', configStatus)
}

export { supabase }
