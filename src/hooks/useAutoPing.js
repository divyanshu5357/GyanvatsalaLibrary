import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import { SESSION_CONFIG } from '../config/sessionConfig'

const AUTO_PING_INTERVAL = SESSION_CONFIG.autoPing.interval
const AUTO_PING_ENABLED = SESSION_CONFIG.autoPing.enabled
const AUTO_PING_VERBOSE = SESSION_CONFIG.autoPing.verbose
const RESPECT_VISIBILITY = SESSION_CONFIG.autoPing.respectVisibility

/**
 * Hook that sends a lightweight ping to Supabase every 5 minutes
 * to keep the project from pausing (prevents cold starts).
 * 
 * Only pings when:
 * - User is logged in
 * - The browser tab is active (using Page Visibility API)
 * 
 * Automatically cleans up timers on unmount.
 */
export function useAutoPing() {
  const { currentUser } = useAuth()
  const pingIntervalRef = useRef(null)
  const lastPingRef = useRef(Date.now())

  useEffect(() => {
    // Clear any existing interval on setup
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    // Don't set up auto-ping if disabled, user is not logged in, or supabase is unavailable
    if (!AUTO_PING_ENABLED || !currentUser || !supabase) {
      return
    }

    /**
     * Performs the actual ping to Supabase
     * Uses a lightweight query to keep the connection warm
     */
    const performPing = async () => {
      try {
        // Check if tab is visible before pinging (if enabled)
        if (RESPECT_VISIBILITY && document.hidden) {
          if (AUTO_PING_VERBOSE) {
            console.log('⏸️ Tab is inactive, skipping ping')
          }
          return
        }

        const now = Date.now()
        const timeSinceLastPing = now - lastPingRef.current

        // Log ping activity
        if (AUTO_PING_VERBOSE) {
          console.log(
            `📡 Auto-ping: keeping project warm (${timeSinceLastPing / 1000}s since last ping)`
          )
        }

        // Perform a lightweight query to Supabase
        // This can be any simple query to the database
        await supabase
          .from('users') // Using a system table that's guaranteed to exist
          .select('count', { count: 'exact', head: true })
          .limit(1)

        lastPingRef.current = now
        if (AUTO_PING_VERBOSE) {
          console.log('✅ Ping successful')
        }
      } catch (error) {
        // Log error but don't interrupt the user experience
        if (AUTO_PING_VERBOSE) {
          console.warn('⚠️ Auto-ping failed:', error.message)
        }
      }
    }

    // Initial ping on effect setup
    performPing()

    // Set up recurring ping
    pingIntervalRef.current = setInterval(() => {
      performPing()
    }, AUTO_PING_INTERVAL)

    // Cleanup function
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    }
  }, [currentUser])
}
