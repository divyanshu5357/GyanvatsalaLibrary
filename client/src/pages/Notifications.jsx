import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { authFetch } from '../utils/api'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await authFetch('/api/admin/notifications')
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Failed to load notifications')
        }
        const data = await res.json()
        setItems(data.notifications || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-4">Notifications</h1>

          {loading && <div className="p-4 glass rounded">Loading...</div>}
          {error && <div className="p-4 glass rounded border border-red-500 text-red-200">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="p-4 glass rounded text-slate-300">No notifications right now.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((n, idx) => {
                const isOverdue = n.status === 'overdue'
                return (
                  <div key={idx} className={`glass p-4 rounded border ${isOverdue ? 'border-red-500/50' : 'border-amber-400/40'} flex items-start gap-3`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-600/30 text-red-100' : 'bg-amber-500/30 text-amber-100'}`}>
                      {isOverdue ? '⚠️' : '⏰'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{n.name} {n.seatNumber ? `(Seat ${n.seatNumber})` : ''}</p>
                          <p className="text-sm text-slate-300">{n.message}</p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${isOverdue ? 'bg-red-600/30 text-red-200' : 'bg-amber-600/30 text-amber-100'}`}>
                          {isOverdue ? `Overdue by ${Math.abs(n.daysRemaining)}d` : `Due in ${n.daysRemaining}d`}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Due: {n.dueDate ? new Date(n.dueDate).toLocaleDateString() : '—'} · Fee: {n.feeAmount ? `₹${n.feeAmount}` : '—'} · Email: {n.email || '—'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
