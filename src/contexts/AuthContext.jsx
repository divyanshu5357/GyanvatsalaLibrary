import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { apiBase } from '../utils/api'

const AuthContext = createContext()
const ALLOWED_ROLES = new Set(['admin', 'student'])

export function useAuth() {
  return useContext(AuthContext)
}

async function fetchVerifiedProfile(accessToken) {
  try {
    const response = await fetch(`${apiBase}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error('Unauthorized: Please check your credentials')
      }
      throw new Error(body?.error || 'Failed to validate session')
    }

    const data = await response.json()
    const profile = data?.profile || null

    if (!profile?.id || !ALLOWED_ROLES.has(profile.role)) {
      throw new Error('Invalid user profile or role')
    }

    return profile
  } catch (err) {
    console.error('Profile fetch error:', err.message)
    throw err
  }
}

async function clearLocalAuthState() {
  if (!supabase) return

  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (_) {}
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  function applyAuthState(nextUser, nextProfile) {
    setCurrentUser(nextUser)
    setProfile(nextProfile)
  }

  async function resolveAuthState(session) {
    const accessToken = session?.access_token || ''

    if (!accessToken) {
      return { user: null, profile: null, shouldClear: false }
    }

    const { data, error } = await supabase.auth.getUser(accessToken)
    const user = data?.user || null

    if (error || !user) {
      return { user: null, profile: null, shouldClear: true }
    }

    const profileData = await fetchVerifiedProfile(accessToken)

    return {
      user,
      profile: profileData,
      shouldClear: false,
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let isMounted = true

    const syncSession = async (session, eventLabel = 'session') => {
      try {
        if (!isMounted) return

        setLoading(true)
        console.log(`🔍 Syncing auth state from ${eventLabel}...`)

        const { user, profile: profileData, shouldClear } = await resolveAuthState(session)

        if (!isMounted) return

        if (shouldClear) {
          await clearLocalAuthState()
          if (!isMounted) return
          applyAuthState(null, null)
          console.warn('⚠️ Cleared invalid local auth session')
          return
        }

        applyAuthState(user, profileData)

        if (user && profileData) {
          console.log('✅ Profile fetched:', profileData.role)
        } else {
          console.log('ℹ️ No user session found')
        }
      } catch (err) {
        if (!isMounted) return

        console.error('❌ Auth sync error:', err.message)
        await clearLocalAuthState()
        if (!isMounted) return
        applyAuthState(null, null)
      } finally {
        if (!isMounted) return

        console.log('✅ Loading complete')
        setLoading(false)
      }
    }

    const bootstrapSession = async () => {
      try {
        console.log('🔍 Checking session...')
        const { data: { session } } = await supabase.auth.getSession()
        await syncSession(session, 'initial session check')
      } catch (err) {
        if (!isMounted) return
        console.error('❌ Session check error:', err.message)
        await clearLocalAuthState()
        if (!isMounted) return
        applyAuthState(null, null)
        setLoading(false)
      }
    }

    bootstrapSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth changed:', _event)
      Promise.resolve().then(() => syncSession(session, _event))
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  async function signup() {
    throw new Error('Signup is disabled. Accounts must be created by admin.')
  }

  async function login(email, password) {
    try {
      setLoading(true)

      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      const normalizedEmail = email.trim().toLowerCase()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        throw error
      }

      const accessToken = data?.session?.access_token || ''
      if (!accessToken) throw new Error('Login failed: session token missing')

      const { data: verifiedData, error: verifiedError } = await supabase.auth.getUser(accessToken)
      const user = verifiedData?.user || null

      if (verifiedError || !user) {
        throw new Error('Login failed: session could not be verified')
      }

      const profileData = await fetchVerifiedProfile(accessToken)
      applyAuthState(user, profileData)

      return {
        user,
        profile: profileData,
      }
    } catch (err) {
      console.error('❌ Login error:', err.message)
      await clearLocalAuthState()
      applyAuthState(null, null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      console.log('🚪 Signing out...')
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) throw error
      }
      console.log('✅ Signed out successfully from Supabase')
    } catch (err) {
      console.error('❌ Signout error:', err.message)
    } finally {
      setCurrentUser(null)
      setProfile(null)
      setLoading(false)

      try {
        sessionStorage.clear()
      } catch (_) {}

      console.log('✅ Session cleared, redirecting to home...')
      window.location.replace('/auth')
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      loading,
      signup,
      login,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
