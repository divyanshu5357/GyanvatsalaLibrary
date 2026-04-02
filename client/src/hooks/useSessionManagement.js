/**
 * Session Management Hook
 * 
 * This component integrates the auto-ping and inactivity logout features
 * into the application. It should be placed at a high level in the component
 * tree, typically inside the AuthProvider.
 * 
 * Features:
 * 1. Auto-ping: Sends a lightweight request to Supabase every 5 minutes
 *    - Keeps the project from pausing (prevents cold starts)
 *    - Only pings when user is logged in and tab is active
 * 
 * 2. Inactivity Logout: Automatically logs out user after 5 minutes of inactivity
 *    - Tracks: mouse, clicks, keyboard, scroll, touch
 *    - Logs out via Supabase
 *    - Redirects to login page
 */

import { useAutoPing } from './useAutoPing'
import { useInactivityLogout } from './useInactivityLogout'

export function useSessionManagement() {
  // Enable auto-ping to keep project warm
  useAutoPing()

  // Enable inactivity-based logout
  const { triggerLogout } = useInactivityLogout()

  return { triggerLogout }
}

export default useSessionManagement
