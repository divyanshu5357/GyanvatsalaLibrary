import React, { useEffect } from 'react'

const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const typeConfig = {
    success: {
      bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
      icon: '✓',
      border: 'border-green-400',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600 to-pink-600',
      icon: '✕',
      border: 'border-red-400',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-600 to-orange-600',
      icon: '!',
      border: 'border-amber-400',
    },
    info: {
      bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      icon: 'ℹ',
      border: 'border-indigo-400',
    },
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 text-white shadow-xl animate-slideInRight mb-3 flex items-center gap-3`}
      style={{
        animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(400px);
          }
        }
      `}</style>

      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <span className="text-lg font-bold">{config.icon}</span>
        </div>
      </div>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        ✕
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-white/30 animate-shrink rounded-b-lg"
        style={{
          animation: 'shrink 4s linear forwards',
          right: 0,
        }}
      ></div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export default function AnimatedToastStack({ items = [], onRemove = () => {} }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm">
      {items.map((item) => (
        <Toast
          key={item.id}
          id={item.id}
          message={item.message}
          type={item.type}
          onClose={() => onRemove(item.id)}
        />
      ))}
    </div>
  )
}
