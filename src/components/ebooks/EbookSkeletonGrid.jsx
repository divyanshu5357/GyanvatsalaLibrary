import React from 'react'

export default function EbookSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass rounded-2xl p-4 border border-slate-700/60 animate-pulse">
          <div className="h-36 rounded-xl bg-slate-700/60 mb-4" />
          <div className="h-4 rounded bg-slate-700/70 mb-3" />
          <div className="h-3 rounded bg-slate-700/50 w-2/3 mb-2" />
          <div className="h-3 rounded bg-slate-700/50 w-1/2" />
        </div>
      ))}
    </div>
  )
}
