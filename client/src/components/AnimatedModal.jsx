import React, { useEffect } from 'react'

export default function AnimatedModal({ open, title, message, onConfirm, onCancel, isDangerous = false }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onCancel}
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isDangerous 
            ? '0 20px 60px rgba(239, 68, 68, 0.15)' 
            : '0 20px 60px rgba(99, 102, 241, 0.15)'
        }}
      >
        {/* Icon with animation */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              isDangerous
                ? 'bg-red-500/20 border-2 border-red-400/50'
                : 'bg-indigo-500/20 border-2 border-indigo-400/50'
            }`}
            style={{ animation: 'iconBounce 2s ease-in-out infinite' }}
          >
            {isDangerous ? '⚠️' : 'ℹ️'}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
        <p className="text-slate-300 mb-6 text-center leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-100 font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 border border-slate-600/50 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
              isDangerous
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-500/50 hover:border-red-400 shadow-lg shadow-red-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border-indigo-500/50 hover:border-indigo-400 shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isDangerous ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
