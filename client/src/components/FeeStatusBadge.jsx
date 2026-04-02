import React from 'react'
import { getDueDate, isPaidForCurrentCycle } from '../utils/feeStatus'

export function FeeStatusBadge({ student }) {
  const today = new Date()
  const dueDate = getDueDate(student)
  const hasPayment = isPaidForCurrentCycle(student)

  if (!dueDate) {
    return <span className="text-xs text-slate-400">No due date</span>
  }

  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))

  if (hasPayment) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-semibold text-emerald-200">
        🟢 Paid
      </span>
    )
  }

  if (daysUntilDue < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/50 text-xs font-semibold text-red-200 animate-pulse">
        🔴 Overdue
      </span>
    )
  }

  if (daysUntilDue <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-xs font-semibold text-amber-200">
        🟡 Due Soon ({daysUntilDue}d)
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 text-xs font-semibold text-blue-200">
      🔵 Due
    </span>
  )
}

export default FeeStatusBadge
