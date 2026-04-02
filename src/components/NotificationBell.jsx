import React from 'react'

export default function NotificationBell({ onClick, count = 0 }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="p-2 rounded-full bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Notifications"
      >
        🔔
      </button>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-semibold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  )
}
