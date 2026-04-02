import React from 'react'

const AnimatedAlert = ({ id, title, message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const typeConfig = {
    success: {
      bg: 'from-emerald-600 to-green-600',
      border: 'border-emerald-400/50',
      icon: '✓',
      shadow: 'shadow-emerald-500/20',
    },
    error: {
      bg: 'from-red-600 to-rose-600',
      border: 'border-red-400/50',
      icon: '✕',
      shadow: 'shadow-red-500/20',
    },
    warning: {
      bg: 'from-amber-600 to-orange-600',
      border: 'border-amber-400/50',
      icon: '!',
      shadow: 'shadow-amber-500/20',
    },
    info: {
      bg: 'from-indigo-600 to-purple-600',
      border: 'border-indigo-400/50',
      icon: 'ℹ',
      shadow: 'shadow-indigo-500/20',
    },
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <div
      className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-lg p-4 text-white shadow-lg ${config.shadow} animate-slideInRight mb-3 flex items-start gap-3`}
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
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/25 font-bold text-lg">
          {config.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-white/80 mt-1 leading-snug">{message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        ✕
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
        style={{
          animation: 'shrink 4s linear forwards',
          right: 0,
        }}
      ></div>
    </div>
  )
}

export default function AlertStack({ alerts = [], onClose = () => {} }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm pointer-events-none">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <AnimatedAlert
            id={alert.id}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  )
}
