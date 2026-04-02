import React, { useState } from 'react'

export default function PasswordModal({ isOpen, onClose, onSubmit, studentName, isLoading }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Password is required')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    onSubmit(password)
    setPassword('')
    setConfirmPassword('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl animate-slideInUp overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">🔐 Set Password</h2>
          <p className="text-sm text-indigo-100 mt-1">For: {studentName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              placeholder="Re-enter password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Password Requirements */}
          <div className="p-3 bg-slate-700/50 rounded text-xs text-slate-400 space-y-1">
            <p>✓ At least 6 characters</p>
            <p>✓ Passwords must match</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                '✓ Set Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
