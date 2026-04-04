import { supabase } from '../supabase'

function normalizeApiBase(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function resolveApiBase() {
  const configuredApiBase = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
  if (!configuredApiBase || typeof window === 'undefined') {
    return configuredApiBase
  }

  if (!isLocalHostname(window.location.hostname)) {
    return configuredApiBase
  }

  try {
    const configuredUrl = new URL(configuredApiBase, window.location.origin)
    if (isLocalHostname(configuredUrl.hostname)) {
      return configuredApiBase
    }

    console.warn(`Ignoring remote VITE_API_BASE_URL on localhost: ${configuredApiBase}`)
    return ''
  } catch (_) {
    return configuredApiBase
  }
}

export const apiBase = resolveApiBase()

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
