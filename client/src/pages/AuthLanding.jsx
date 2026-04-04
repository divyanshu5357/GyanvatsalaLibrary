import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthLanding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Top bar with Home button */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-12 relative z-10">
        <div className="text-2xl font-bold text-white">📚 Gyanvatsala Library</div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm border border-white/20 text-white transition-all"
        >
          ← Back to Home
        </button>
      </div>

      {/* Main content - Two column layout */}
      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left Section - Welcome Message */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Welcome to<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gyanvatsala Library
              </span>
            </h1>
            <p className="text-xl text-slate-300">
              Your gateway to unlimited knowledge, books, and learning resources.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-200">
              <span className="text-2xl">📖</span>
              <p>Access thousands of e-books and resources</p>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <span className="text-2xl">🎓</span>
              <p>Track your reading progress and achievements</p>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <span className="text-2xl">💻</span>
              <p>Seamless access across all your devices</p>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <span className="text-2xl">⚡</span>
              <p>Fast, secure, and always available</p>
            </div>
          </div>

          {/* CTA for no credentials */}
          <div className="card-hover space-y-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-1">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Don't have credentials?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  If you're a student or staff member but don't have login credentials yet, please contact the library administrator to get your account set up.
                </p>
                <a
                  href="mailto:admin@gyanvatsala.com?subject=Request%20for%20Library%20Account&body=Hello,%20I%20would%20like%20to%20request%20library%20account%20credentials."
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded text-amber-200 text-sm font-medium transition-all"
                >
                  📧 Contact Admin
                </a>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2 text-sm text-slate-400">
            <p>Need help? <a href="#" className="text-purple-400 hover:text-purple-300">View FAQ</a></p>
            <p>Privacy & Terms: <a href="#" className="text-purple-400 hover:text-purple-300">Learn more</a></p>
          </div>
        </div>

        {/* Right Section - Info Box */}
        <div className="flex items-center justify-center">
          <div className="card-hover glass backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Login to Your Account</h2>
              <p className="text-slate-300 text-sm">
                Access your personalized dashboard and library resources
              </p>
            </div>

            <div className="card-hover space-y-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">👤</span>
                <div>
                  <p className="text-white font-medium">Student/Staff Login</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Use your registered email and password to access the dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🔐</span>
                <div>
                  <p className="text-white font-medium">Secure Access</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Your credentials are encrypted and protected
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">10K+</p>
                <p className="text-xs text-slate-400">Books</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">5K+</p>
                <p className="text-xs text-slate-400">Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">24/7</p>
                <p className="text-xs text-slate-400">Available</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '#login-form'}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              Proceed to Login ↓
            </button>
          </div>
        </div>
      </div>

      {/* Bottom section - Additional info */}
      <div className="w-full max-w-7xl mt-16 relative z-10">
        <div className="card-hover bg-gradient-to-r from-slate-800/50 to-purple-900/50 border border-slate-700/50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Quick Access</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white font-semibold">For New Users</p>
                <p className="text-slate-400 text-sm">First time here? Contact admin to register</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="text-white font-semibold">Forgot Password?</p>
                <p className="text-slate-400 text-sm">Use password recovery during login</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❓</span>
              <div>
                <p className="text-white font-semibold">Need Help?</p>
                <p className="text-slate-400 text-sm">Contact library support team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
