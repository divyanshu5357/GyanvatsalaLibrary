import React from 'react'

export default function NotificationDropdown({ items = [], onMarkRead }) {
  return (
  <div className="absolute top-12 right-0 w-[360px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-pop">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="font-semibold text-lg">Notifications</span>
        <button className="text-xs text-indigo-300 hover:text-indigo-200" onClick={onMarkRead}>Mark all read</button>
      </div>
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800">
        {items.length === 0 && (
          <div className="p-4 text-sm text-slate-400">No notifications</div>
        )}
        {items.map(item => {
          const overdue = item.type === 'overdue'
          return (
            <div key={item.id} className={`p-4 text-sm ${item.read ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xl ${overdue ? 'text-red-300' : 'text-amber-200'}`}>{overdue ? '⚠️' : '🔔'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-50">{overdue ? 'Overdue' : 'Due Soon'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${overdue ? 'bg-red-500/20 text-red-200' : 'bg-amber-500/20 text-amber-100'}`}>
                      {overdue ? 'Overdue' : 'Due soon'}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-snug mt-1">{item.message}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
