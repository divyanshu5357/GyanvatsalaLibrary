import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

const hasConfig = supabaseUrl && supabaseAnonKey
if (hasConfig) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    // eslint-disable-next-line no-console
    console.log('✅ Supabase initialized successfully')
    console.log('   URL:', supabaseUrl.substring(0, 30) + '...')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Supabase initialization error:', err)
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '❌ Supabase config missing. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example) and restart the dev server.'
  )
}

// Helper to test Supabase connectivity
async function testSupabaseConnectivity() {
  if (!supabase) return { ok: false, error: 'Supabase not initialized' }
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { hasSession: !!data?.session } }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// Ping function to keep Supabase project active
async function pingSupabase() {
  if (!supabase) return
  try {
    await supabase.auth.getSession()
  } catch (err) {
    console.warn('Supabase ping failed:', err.message)
  }
}

// Set up auto-ping every 12 hours
if (typeof window !== 'undefined') {
  setInterval(pingSupabase, 12 * 60 * 60 * 1000)
}

export { supabase, testSupabaseConnectivity, pingSupabase }
