import React from 'react'

export default function AnimatedLoader() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="space-y-6">
        {/* Animated Gradient Orb */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          
          {/* Middle rotating ring (opposite direction) */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-400 border-l-purple-400 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Loading text with animation */}
        <div className="text-center">
          <p className="text-white font-medium text-lg">
            Loading
            <span className="inline-block ml-1 animate-bounce" style={{ animationDelay: '0s' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </p>
          <p className="text-slate-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    </div>
  )
}
