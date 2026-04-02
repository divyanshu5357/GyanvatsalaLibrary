import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SESSION_CONFIG } from '../config/sessionConfig'

const INACTIVITY_TIMEOUT = SESSION_CONFIG.inactivityLogout.timeout
const INACTIVITY_LOGOUT_ENABLED = SESSION_CONFIG.inactivityLogout.enabled
const INACTIVITY_LOGOUT_VERBOSE = SESSION_CONFIG.inactivityLogout.verbose
const ACTIVITY_EVENTS = SESSION_CONFIG.inactivityLogout.activityEvents
const WARNING_TIME = SESSION_CONFIG.inactivityLogout.warningTime

/**
 * Hook that tracks user activity (mouse, clicks, keyboard, scroll)
 * and automatically logs the user out after 5 minutes of inactivity.
 * 
 * Features:
 * - Tracks: mouse movement, clicks, keyboard input, scrolling
 * - Logs out via Supabase auth
 * - Redirects to login page on logout
 * - Cleans up all event listeners on unmount
 * - Properly handles tab visibility changes
 * 
 * Only activates when user is logged in.
 */
export function useInactivityLogout() {
  const { currentUser, signOut } = useAuth()
  const inactivityTimerRef = useRef(null)
  const warningTimerRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const isCleaningUpRef = useRef(false)

  /**
   * Handles inactivity timeout - logs user out
   */
  const handleInactivityTimeout = useCallback(async () => {
    if (isCleaningUpRef.current) return

    if (INACTIVITY_LOGOUT_VERBOSE) {
      console.log('⏱️ Inactivity timeout reached - logging out user')
    }
    isCleaningUpRef.current = true

    try {
      await signOut()
    } catch (error) {
      if (INACTIVITY_LOGOUT_VERBOSE) {
        console.error('❌ Error during inactivity logout:', error.message)
      }
      // Force redirect to login even if signOut fails
      window.location.replace(SESSION_CONFIG.global.logoutRedirectUrl)
    }
  }, [signOut])

  /**
   * Handles inactivity warning (if configured)
   */
  const handleInactivityWarning = useCallback(() => {
    if (INACTIVITY_LOGOUT_VERBOSE) {
      console.warn('⚠️ Inactivity warning: User will be logged out soon')
    }
    // You can implement a warning modal here if needed
    // Dispatch event or call context to show warning
  }, [])

  /**
   * Resets the inactivity timer on user activity
   */
  const resetInactivityTimer = useCallback(() => {
    // Don't reset if cleanup is in progress
    if (isCleaningUpRef.current) return

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only log and reset if significant time has passed since last activity
    if (timeSinceLastActivity > 1000 && INACTIVITY_LOGOUT_VERBOSE) {
      console.log(`🖱️ User activity detected (${(timeSinceLastActivity / 1000).toFixed(1)}s idle)`)
    }

    lastActivityRef.current = now

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }

    // Set warning timer if configured
    if (WARNING_TIME) {
      warningTimerRef.current = setTimeout(() => {
        handleInactivityWarning()
      }, INACTIVITY_TIMEOUT - WARNING_TIME)
    }

    // Set main inactivity timeout
    inactivityTimerRef.current = setTimeout(() => {
      handleInactivityTimeout()
    }, INACTIVITY_TIMEOUT)
  }, [handleInactivityTimeout, handleInactivityWarning])

  useEffect(() => {
    // Only set up inactivity tracking when enabled and user is logged in
    if (!INACTIVITY_LOGOUT_ENABLED || !currentUser) {
      // Clean up if user logs out while timer exists
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
        warningTimerRef.current = null
      }
      isCleaningUpRef.current = false
      return
    }

    // Initial timer setup
    resetInactivityTimer()

    // Create a debounced activity handler to avoid excessive logging
    let lastActivityLogTime = 0
    const activityHandler = () => {
      const now = Date.now()
      if (now - lastActivityLogTime > 1000) {
        // Only log every 1 second to avoid spam
        lastActivityLogTime = now
      }
      resetInactivityTimer()
    }

    // Add listeners for configured activity events
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, activityHandler, true)
    })

    if (INACTIVITY_LOGOUT_VERBOSE) {
      console.log('✅ Inactivity logout tracking enabled')
    }

    // Cleanup function
    return () => {
      // Remove all activity listeners
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, activityHandler, true)
      })

      // Clear inactivity timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
        warningTimerRef.current = null
      }

      if (INACTIVITY_LOGOUT_VERBOSE) {
        console.log('🧹 Inactivity logout tracking cleaned up')
      }
    }
  }, [currentUser, resetInactivityTimer])

  /**
   * Expose a method to manually trigger logout if needed
   */
  return {
    triggerLogout: handleInactivityTimeout,
  }
}
