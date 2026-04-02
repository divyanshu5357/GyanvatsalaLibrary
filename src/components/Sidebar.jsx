import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { to: '/admin/students', label: '📚 Students', icon: '📚' },
    { to: '/admin/ebooks', label: '📘 Manage Ebooks', icon: '📘' },
    { to: '/admin/fees', label: '💳 Fees', icon: '💳' },
    { to: '/admin/earnings', label: '💰 Earnings', icon: '💰' },
    { to: '/admin/due-soon', label: '⏰ Due Soon', icon: '⏰' },
    { to: '/admin/defaulters', label: '⚠️ Defaulters', icon: '⚠️' },
    { to: '/notifications', label: '🔔 Notifications', icon: '🔔' },
  ]

  return (
    <>
      {/* Desktop Sidebar - Always visible on desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-800/50 border-r border-slate-700 min-h-screen fixed left-0 top-16 bottom-0 p-4 overflow-y-auto z-10">
        <div className="text-xl font-bold mb-8 text-white flex items-center gap-2">
          <img src="/image/logo.svg" alt="Gyanvatsala" className="h-6 w-6" />
          <span>Gyanvatsala</span>
        </div>
        <nav className="flex flex-col gap-1 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg transition text-base font-medium flex items-center gap-3 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label.split(' ').slice(1).join(' ')}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile/Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-30 top-16"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <nav className="fixed left-0 top-16 w-72 max-w-80 h-[calc(100vh-64px)] bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto z-40 flex flex-col gap-2 shadow-2xl">
            <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <img src="/image/logo.svg" alt="Gyanvatsala" className="h-5 w-5" />
              <span>Menu</span>
            </div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3.5 rounded-lg transition text-base font-medium flex items-center gap-3 active:scale-95 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
