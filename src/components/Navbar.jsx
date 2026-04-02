import React, { useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'
import NotificationDropdown from './NotificationDropdown'
import { useNotifications } from '../contexts/NotificationContext'

export default function Navbar({ onMenuToggle, mobileMenuOpen }) {
  const { profile, signOut } = useAuth()
  const { unreadCount, items, dropdownOpen, setDropdownOpen, markAllRead } = useNotifications()
  const dropdownRef = useRef(null)

  const toggleDropdown = async () => {
    // Request permission on user gesture (click)
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch (_) {}
    }
    setDropdownOpen(prev => !prev)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 flex items-center px-3 lg:px-6 z-40 shadow-lg">
      {/* Left Section - Menu Button + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Show on mobile/tablet, hide on desktop */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition active:scale-95"
          title="Toggle menu"
        >
          <span className={`text-2xl transition ${mobileMenuOpen ? 'rotate-90' : ''}`}>☰</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/image/logo.svg" alt="Gyanvatsala Logo" className="h-8 w-8" />
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-slate-300">Gyanvatsala</div>
            <div className="text-xs text-slate-500">Library</div>
          </div>
        </div>
      </div>

      {/* Right Section - Notifications + Profile + Logout */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <NotificationBell count={unreadCount} onClick={toggleDropdown} />
          {dropdownOpen && (
            <NotificationDropdown items={items} onMarkRead={markAllRead} />
          )}
        </div>

        {/* Profile Name - Hidden on small screens */}
        <div className="hidden sm:block text-xs sm:text-sm text-slate-300 min-w-max">
          {profile?.name || profile?.email || 'Guest'}
        </div>

        {/* Logout Button */}
        <button
          onClick={signOut}
          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium active:scale-95"
          title="Logout"
        >
          🚪
        </button>
      </div>
    </header>
  )
}
