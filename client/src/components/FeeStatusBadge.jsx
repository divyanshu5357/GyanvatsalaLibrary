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

  // Already paid in current cycle
  if (hasPayment) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-semibold text-emerald-200">
        ✅ Paid
      </span>
    )
  }

  // Fee due date has passed
  if (daysUntilDue < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/50 text-xs font-semibold text-red-200 animate-pulse">
        🔴 Overdue
      </span>
    )
  }

  // Due within next 3 days (0, 1, 2, or 3 days)
  if (daysUntilDue >= 0 && daysUntilDue <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-xs font-semibold text-amber-200">
        ⚠️ Due ({daysUntilDue}d)
      </span>
    )
  }

  // More than 3 days away - show as Paid (fee not yet due, payment pending)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-semibold text-emerald-200">
      ✅ Paid
    </span>
  )
}

export default FeeStatusBadge
