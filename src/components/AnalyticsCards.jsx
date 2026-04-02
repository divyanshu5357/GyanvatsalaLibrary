import React, { useState, useEffect } from 'react'
import { getDueDate, isPaidForCurrentCycle } from '../utils/feeStatus'

// Use relative paths in development (proxied by Vite)
const apiBase = import.meta.env.VITE_API_BASE_URL || ''

export function DefaultersList({ students = [] }) {
  const defaulters = students.filter(s => {
    const hasPayment = isPaidForCurrentCycle(s)
    const dueDate = getDueDate(s)
    if (!dueDate) return false

    const today = new Date()
    const isOverdue = dueDate < today && !hasPayment
    return isOverdue
  }).sort((a, b) => new Date(a.fee_due_date || a.next_due) - new Date(b.fee_due_date || b.next_due))

  if (defaulters.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        ✨ No defaulters! All fees are up to date.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {defaulters.map(student => {
        const daysOverdue = Math.floor((new Date() - new Date(student.fee_due_date || student.next_due)) / (1000 * 60 * 60 * 24))
        return (
          <div key={student.id} className="p-4 bg-red-500/10 border border-red-400/50 rounded-lg animate-slideInUp">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">{student.user?.name}</h4>
                <p className="text-xs text-red-200 mt-1">📧 {student.user?.email}</p>
                <p className="text-xs text-red-200">📞 {student.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-red-300">₹{student.fee_amount}</div>
                <div className="text-xs text-red-200 mt-1">Overdue by {daysOverdue} days</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DueSoonList({ students = [] }) {
  const today = new Date()
  const dueSoon = students.filter(s => {
    const hasPayment = isPaidForCurrentCycle(s)
    if (hasPayment) return false

    const dueDate = getDueDate(s)
    if (!dueDate) return false

    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7

    return isDueSoon
  })

  if (dueSoon.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        ✅ No fees due soon.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dueSoon.map(student => {
        const daysUntilDue = Math.ceil((new Date(student.fee_due_date || student.next_due) - today) / (1000 * 60 * 60 * 24))
        return (
          <div key={student.id} className="p-4 bg-amber-500/10 border border-amber-400/50 rounded-lg animate-slideInUp">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">{student.user?.name}</h4>
                <p className="text-xs text-amber-200 mt-1">📧 {student.user?.email}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-300">₹{student.fee_amount}</div>
                <div className="text-xs text-amber-200 mt-1">Due {daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} days`}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function MonthlyEarnings({ students = [] }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const monthlyEarnings = students.reduce((total, student) => {
    if (!student.last_payment && !student.fee_submission_date) return total
    const paymentDate = new Date(student.last_payment || student.fee_submission_date)
    if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
      return total + (student.fee_amount || 0)
    }
    return total
  }, 0)

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg p-6 shadow-lg">
      <div className="text-emerald-100 text-sm font-medium mb-2">Monthly Earnings</div>
      <div className="text-4xl font-bold text-white">₹{monthlyEarnings.toLocaleString()}</div>
      <div className="text-emerald-200 text-xs mt-2">
        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}

export function AnalyticsOverview({ students = [] }) {
  const today = new Date()
  
  const stats = {
    totalStudents: students.length,
    paidFees: students.filter(s => isPaidForCurrentCycle(s)).length,
    overdue: students.filter(s => {
      const hasPayment = isPaidForCurrentCycle(s)
      const dueDate = getDueDate(s)
      return !hasPayment && dueDate && dueDate < today
    }).length,
    dueSoon: students.filter(s => {
      const hasPayment = isPaidForCurrentCycle(s)
      if (hasPayment) return false
      const dueDate = getDueDate(s)
      if (!dueDate) return false
      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))
      return daysUntilDue >= 0 && daysUntilDue <= 3
    }).length,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="glass rounded-lg p-4 border-l-4 border-indigo-500">
        <div className="text-xs text-slate-400 mb-1">Total Students</div>
        <div className="text-3xl font-bold text-indigo-300">{stats.totalStudents}</div>
      </div>
      <div className="glass rounded-lg p-4 border-l-4 border-emerald-500">
        <div className="text-xs text-slate-400 mb-1">Fees Paid</div>
        <div className="text-3xl font-bold text-emerald-300">{stats.paidFees}</div>
      </div>
      <div className="glass rounded-lg p-4 border-l-4 border-red-500">
        <div className="text-xs text-slate-400 mb-1">Overdue</div>
        <div className="text-3xl font-bold text-red-300">{stats.overdue}</div>
      </div>
      <div className="glass rounded-lg p-4 border-l-4 border-amber-500">
        <div className="text-xs text-slate-400 mb-1">Due Soon</div>
        <div className="text-3xl font-bold text-amber-300">{stats.dueSoon}</div>
      </div>
    </div>
  )
}
