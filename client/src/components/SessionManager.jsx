import { useSessionManagement } from '../hooks/useSessionManagement'

/**
 * SessionManager Component
 * 
 * This component activates session management features for the application:
 * - Auto-ping to Supabase (every 5 minutes)
 * - Inactivity-based auto logout (after 5 minutes of no activity)
 * 
 * Place this component inside AuthProvider but outside ProtectedRoute components
 * so it activates whenever a user is logged in.
 * 
 * Usage:
 * ```jsx
 * <AuthProvider>
 *   <SessionManager />
 *   <AppRoutes />
 * </AuthProvider>
 * ```
 */
export default function SessionManager() {
  useSessionManagement()
  
  // This component doesn't render anything, it only manages side effects
  return null
}
