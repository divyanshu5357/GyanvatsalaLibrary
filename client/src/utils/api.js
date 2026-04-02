import { supabase } from '../supabase'

// Use relative paths in development (proxied by Vite)
// Use full URL only if explicitly set in .env
const rawApiBase = import.meta.env.VITE_API_BASE_URL || ''
export const apiBase = rawApiBase.replace(/\/+$/, '')

export async function authFetch(path, options = {}) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    throw error
  }

  const token = session?.access_token
  if (!token) {
    window.location.replace('/auth')
    throw new Error('Authentication required')
  }

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    window.location.replace('/auth')
  }

  return response
}
