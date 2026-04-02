/**
 * Session Management Configuration
 * 
 * This file centralizes all configuration for session management features.
 * Edit these values to customize auto-ping and inactivity logout behavior.
 */

export const SESSION_CONFIG = {
  // Auto-Ping Configuration
  autoPing: {
    // Interval between pings in milliseconds
    // Default: 5 minutes (5 * 60 * 1000)
    interval: 5 * 60 * 1000,

    // Whether to enable auto-ping feature
    enabled: true,

    // Respect page visibility (don't ping when tab is hidden)
    respectVisibility: true,

    // Enable verbose logging for debugging
    verbose: true,
  },

  // Inactivity Logout Configuration
  inactivityLogout: {
    // Timeout before automatic logout in milliseconds
    // Default: 5 minutes (5 * 60 * 1000)
    timeout: 5 * 60 * 1000,

    // Whether to enable inactivity logout feature
    enabled: true,

    // Activity events to track
    // Available: 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'
    activityEvents: ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'],

    // Enable verbose logging for debugging
    verbose: true,

    // Show warning before logout (optional, implement in your app)
    // Time in milliseconds before logout to show warning
    warningTime: null, // Set to 1 * 60 * 1000 for 1 minute before logout
  },

  // Global Configuration
  global: {
    // Redirect URL after logout
    logoutRedirectUrl: '/auth',

    // Enable all session management features
    enableSessionManagement: true,
  },
}

/**
 * QUICK START CUSTOMIZATION EXAMPLES
 */

// Example 1: Shorter timeouts for testing
// export const SESSION_CONFIG = {
//   autoPing: {
//     interval: 30 * 1000, // 30 seconds
//   },
//   inactivityLogout: {
//     timeout: 1 * 60 * 1000, // 1 minute
//   },
// }

// Example 2: Disable specific features
// export const SESSION_CONFIG = {
//   autoPing: {
//     enabled: false,
//   },
//   inactivityLogout: {
//     enabled: true,
//   },
// }

// Example 3: Production configuration (no verbose logging)
// export const SESSION_CONFIG = {
//   autoPing: {
//     verbose: false,
//   },
//   inactivityLogout: {
//     verbose: false,
//   },
// }

// Example 4: Advanced configuration with warning
// export const SESSION_CONFIG = {
//   autoPing: {
//     interval: 5 * 60 * 1000,
//     enabled: true,
//     respectVisibility: true,
//     verbose: true,
//   },
//   inactivityLogout: {
//     timeout: 10 * 60 * 1000, // 10 minutes
//     enabled: true,
//     activityEvents: ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'],
//     verbose: true,
//     warningTime: 1 * 60 * 1000, // Show warning 1 minute before logout
//   },
//   global: {
//     logoutRedirectUrl: '/auth',
//     enableSessionManagement: true,
//   },
// }

export default SESSION_CONFIG
