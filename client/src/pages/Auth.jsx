import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getDashboardRoute } from '../utils/authRouting'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, currentUser, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading || !currentUser || !profile?.role) return
    navigate(getDashboardRoute(profile.role), { replace: true })
  }, [authLoading, currentUser, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email.trim(), password)
      if (!result) throw new Error('Login failed')
      const { user, profile } = result
      if (!user) throw new Error('Invalid credentials')
      if (!profile) throw new Error('User profile not found')
      if (!profile.role) throw new Error('User role not set')
      navigate(getDashboardRoute(profile.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white">📚 Gyanvatsala Library</div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition"
        >
          ← Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Features */}
          <div className="text-white hidden lg:block">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Gyanvatsala Library</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8">Your gateway to unlimited knowledge, books, and learning resources.</p>
            
            {/* Features */}
            <div className="space-y-5 mb-12">
              <div className="flex gap-4">
                <div className="text-2xl">📖</div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Access thousands of e-books and resources</h3>
                  <p className="text-slate-300 text-sm">Instant access to thousands of titles across genres</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🎓</div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Track your reading progress and achievements</h3>
                  <p className="text-slate-300 text-sm">Monitor your learning journey with detailed stats</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">📱</div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Seamless access across all your devices</h3>
                  <p className="text-slate-300 text-sm">Read on phone, tablet, or desktop anytime</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">⚡</div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Fast, secure, and always available</h3>
                  <p className="text-slate-300 text-sm">Enterprise-grade security with 99.9% uptime</p>
                </div>
              </div>
            </div>

            {/* Don't have credentials box */}
            <div className="card-hover p-5 rounded-lg bg-red-900/30 border border-red-500/40">
              <div className="flex gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h4 className="font-semibold text-red-100 mb-2">Don't have credentials?</h4>
                  <p className="text-red-100/80 text-sm mb-3">If you're a student or staff member but don't have login credentials yet, please contact the library administrator to get your account set up.</p>
                  <button className="text-sm font-semibold text-red-200 hover:text-red-100 flex items-center gap-2">
                    <span>📧</span>
                    <span>Contact Admin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="card-hover w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
              <p className="text-slate-200 text-sm mb-6">Enter your credentials to access your dashboard</p>

              {error && (
                <div className="mb-5 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-100 mb-2">Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    disabled={loading || authLoading}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-white/50 focus:outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-100 mb-2">Password</label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={loading || authLoading}
                      className="w-full px-4 py-2.5 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-white/50 focus:outline-none transition disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white text-lg"
                      tabIndex={-1}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full py-2.5 mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
                >
                  {loading || authLoading ? 'Logging in...' : 'Login to Dashboard'}
                </button>
              </form>

              <p className="text-xs text-slate-400 text-center mt-5">
                Use your registered credentials to access your personalized dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Help - Bottom Section */}
      <div className="bg-gradient-to-t from-black/40 to-transparent border-t border-white/10 mt-12 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8">Quick Access Help</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New User */}
            <div className="card-hover p-6 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-white text-lg mb-2">New User?</h4>
              <p className="text-slate-300 text-sm">Request account credentials from the admin to get started with your learning journey.</p>
            </div>

            {/* Forgot Password */}
            <div className="card-hover p-6 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50 transition">
              <div className="text-3xl mb-3">🔑</div>
              <h4 className="font-bold text-white text-lg mb-2">Forgot Password?</h4>
              <p className="text-slate-300 text-sm">Use password recovery option or contact admin for account recovery assistance.</p>
            </div>

            {/* Need Assistance */}
            <div className="card-hover p-6 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 transition">
              <div className="text-3xl mb-3">❓</div>
              <h4 className="font-bold text-white text-lg mb-2">Need Assistance?</h4>
              <p className="text-slate-300 text-sm">Email admin@gyanvatsala.com for support and we'll help you get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
