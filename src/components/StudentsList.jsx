import React, { useState, useEffect } from 'react'
import { useAlert } from '../contexts/AlertContext'
import AnimatedModal from './AnimatedModal'
import PasswordModal from './PasswordModal'
import FeeStatusBadge from './FeeStatusBadge'
import { supabase } from '../supabase'
import { getDueDate, isPaidForCurrentCycle } from '../utils/feeStatus'
import { authFetch } from '../utils/api'

export default function StudentsList({ onMetrics = () => {}, feeFilter = 'all', useMetrics = true }) {
  const { showAlert } = useAlert()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', seatNumber: '', feeAmount: '', feeDueDate: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, studentId: null, studentName: '' })
  const [passwordModal, setPasswordModal] = useState({ open: false, studentId: null, studentName: '', isLoading: false })

  const computeAndSendMetrics = (list = []) => {
    const totalStudents = list.length
    const occupiedSeats = list.filter(s => !!s.seat_number).length
    const totalSeats = Math.max(...list.map(s => Number(s.seat_number) || 0), 0) || occupiedSeats
    const pendingFees = list.filter(s => (s.fee_amount || s.fee_due_date || s.next_due) && !isPaidForCurrentCycle(s)).length
    if (useMetrics) onMetrics({ totalStudents, occupiedSeats, totalSeats, pendingFees })
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      setLoading(true)
      setError(null)

      const response = await authFetch('/api/admin/students')
      if (!response.ok) {
        let message = 'Failed to fetch students'
        try {
          const body = await response.json()
          if (body?.error) message = body.error
        } catch (_) {
          // ignore parse errors
        }
        throw new Error(message)
      }

      const data = await response.json()
  const list = data.students || []
  setStudents(list)
  computeAndSendMetrics(list)

      console.log('✅ Students loaded:', list)
    } catch (err) {
      console.error('❌ Error fetching students:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(student) {
    setEditingId(student.id)
    setForm({
      name: student.user?.name || '',
      seatNumber: student.seat_number ?? '',
      feeAmount: student.fee_amount ?? '',
      feeDueDate: student.fee_due_date ? student.fee_due_date.split('T')[0] : student.next_due ? student.next_due.split('T')[0] : '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(studentId) {
    try {
      const payload = {
        name: form.name,
        seatNumber: form.seatNumber === '' ? null : form.seatNumber,
        feeAmount: form.feeAmount === '' ? null : form.feeAmount,
        feeDueDate: form.feeDueDate || null,
      }

      const res = await authFetch(`/api/admin/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to update student')
      }

      await fetchStudents()
      setEditingId(null)
      showAlert({
        title: 'Student updated',
        message: 'Student details saved successfully.',
        type: 'success',
      })
    } catch (err) {
      showAlert({
        title: 'Update failed',
        message: err.message,
        type: 'error',
      })
    }
  }

  async function handleDelete(studentId) {
    const student = students.find(s => s.id === studentId)
    setDeleteModal({ open: true, studentId, studentName: student?.name || 'Student' })
  }

  async function confirmDelete() {
    const { studentId } = deleteModal
    setDeleteModal({ open: false, studentId: null, studentName: '' })

    try {
      const response = await authFetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete student')
      }

      const updated = students.filter(s => s.id !== studentId)
      setStudents(updated)
      computeAndSendMetrics(updated)
      
      showAlert({
        title: 'Success! 🎉',
        message: 'Student has been deleted successfully',
        type: 'success',
      })
    } catch (err) {
      console.error('❌ Error deleting student:', err)
      showAlert({
        title: 'Error',
        message: err.message,
        type: 'error',
      })
    }
  }

  async function handleResetPassword(student) {
    try {
      // Open the password modal instead of sending email
      setPasswordModal({
        open: true,
        studentId: student.id,
        studentName: student.user?.name || 'Student',
        isLoading: false,
      })
    } catch (err) {
      console.error('❌ Error opening password modal:', err)
      showAlert({
        title: 'Error',
        message: 'Failed to open password modal',
        type: 'error',
      })
    }
  }

  async function handleSetPassword(newPassword) {
    try {
      setPasswordModal(prev => ({ ...prev, isLoading: true }))

      const response = await authFetch('/api/admin/set-password', {
        method: 'POST',
        body: JSON.stringify({
          studentId: passwordModal.studentId,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to set password')
      }

      showAlert({
        title: 'Password Updated! ✅',
        message: `Password set successfully for ${passwordModal.studentName}`,
        type: 'success',
      })

      setPasswordModal({ open: false, studentId: null, studentName: '', isLoading: false })
    } catch (err) {
      console.error('❌ Error setting password:', err)
      showAlert({
        title: 'Failed to Set Password',
        message: err.message,
        type: 'error',
      })
      setPasswordModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  async function handleSendReminder(student) {
    try {
      const response = await authFetch('/api/admin/send-reminder', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.id,
          studentEmail: student.user?.email,
          studentName: student.user?.name || 'Student',
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to send reminder')
      }

      showAlert({
        title: 'Reminder Sent! 🔔',
        message: `Reminder sent to ${student.user?.name || 'student'}`,
        type: 'success',
      })
    } catch (err) {
      console.error('❌ Error sending reminder:', err)
      showAlert({
        title: 'Failed to Send Reminder',
        message: err.message,
        type: 'error',
      })
    }
  }

  async function handleFeeStatus(studentId, status) {
    try {
      const response = await authFetch(`/api/admin/students/${studentId}/fee-status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to update fee status')
      }

      showAlert({
        title: status === 'paid' ? 'Marked as Paid ✅' : 'Marked as Unpaid ⚠️',
        message: status === 'paid' ? 'Due date moved to next month.' : 'Student is now marked unpaid for current month.',
        type: 'success',
      })

      await fetchStudents()
    } catch (err) {
      showAlert({
        title: 'Fee Status Update Failed',
        message: err.message,
        type: 'error',
      })
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-slate-400">Loading students...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 space-y-3">
        <div>Error: {error}</div>
        <button
          onClick={fetchStudents}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          Retry
        </button>
        <div className="text-xs text-slate-400">If this keeps happening, check the backend server logs and ensure it's running.</div>
      </div>
    )
  }

  if (students.length === 0) {
    return <div className="p-6 text-center text-slate-400">No students created yet</div>
  }

  // Apply fee filter to the list before rendering
  const filteredStudents = students.filter(s => {
    if (!feeFilter || feeFilter === 'all') return true

    const paid = isPaidForCurrentCycle(s)
    const hasDue = !!(s.fee_amount || s.fee_due_date || s.next_due)
    const now = new Date()
    const dueDate = getDueDate(s)
    const isOverdue = dueDate ? dueDate < now && !paid : false
    
    if (feeFilter === 'paid') return paid
    if (feeFilter === 'due') return hasDue && !paid && !isOverdue
    if (feeFilter === 'overdue') return isOverdue
    return true
  })

  return (
    <div className="p-6">
  <h3 className="text-xl font-bold mb-4">Students ({filteredStudents.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3">Profile</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Seat</th>
              <th className="text-left p-3">Fee Amount</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-left p-3">Fee Due</th>
              <th className="text-left p-3">Paid?</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const avatar = student.user?.avatar_url || student.user?.user_metadata?.avatar_url
              const isEditing = editingId === student.id
              return (
              <tr key={student.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                <td className="p-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                    {avatar ? (
                      <img src={avatar} alt={student.user?.name || 'avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        {student.user?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-transparent border p-1 rounded" />
                  ) : (
                    student.user?.name || 'N/A'
                  )}
                </td>
                <td className="p-3">{student.user?.email || 'N/A'}</td>
                <td className="p-3">{student.phone || 'N/A'}</td>
                <td className="p-3">
                  {isEditing ? (
                    <input value={form.seatNumber} onChange={(e) => setForm(f => ({ ...f, seatNumber: e.target.value }))} className="w-full bg-transparent border p-1 rounded" />
                  ) : (
                    student.seat_number || 'N/A'
                  )}
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input value={form.feeAmount} onChange={(e) => setForm(f => ({ ...f, feeAmount: e.target.value }))} className="w-full bg-transparent border p-1 rounded" />
                  ) : (
                    student.fee_amount ? `₹${student.fee_amount}` : '—'
                  )}
                </td>
                <td className="p-3">
                  <FeeStatusBadge student={student} />
                </td>
                <td className="p-3 text-xs text-slate-400">
                  {student.join_date ? new Date(student.join_date).toLocaleDateString() : '—'}
                </td>
                <td className="p-3 text-xs text-slate-400">
                  {isEditing ? (
                    <input type="date" value={form.feeDueDate} onChange={(e) => setForm(f => ({ ...f, feeDueDate: e.target.value }))} className="w-full bg-transparent border p-1 rounded" />
                  ) : (
                    student.fee_due_date ? new Date(student.fee_due_date).toLocaleDateString() : student.next_due ? new Date(student.next_due).toLocaleDateString() : '—'
                  )}
                </td>
                <td className="p-3 text-xs text-slate-400">
                  {isPaidForCurrentCycle(student) ? 'Paid' : 'Not Paid'}
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <div className="flex flex-col items-stretch gap-2 min-w-[110px]">
                      <button onClick={() => saveEdit(student.id)} className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded shadow hover:bg-emerald-600 transition w-full">Save</button>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleFeeStatus(student.id, 'paid')}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition"
                          title="Mark paid and move due date to next month"
                        >
                          ✅ Mark Paid
                        </button>
                        <button
                          onClick={() => handleFeeStatus(student.id, 'unpaid')}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded shadow hover:bg-amber-700 transition"
                          title="Mark unpaid for current month"
                        >
                          ⚠️ Mark Unpaid
                        </button>
                      </div>
                      <button onClick={cancelEdit} className="px-2.5 py-1.5 text-xs font-semibold bg-slate-700 text-white rounded hover:bg-slate-600 transition w-full">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-stretch gap-1.5 min-w-[140px]">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(student)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-indigo-500 text-white rounded shadow hover:bg-indigo-600 transition group relative"
                          title="Edit student details"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
                          title="Delete student"
                        >
                          �️ Delete
                        </button>
                      </div>
                      <button
                        onClick={() => handleResetPassword(student)}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded shadow hover:bg-orange-700 transition"
                        title="Send password reset link"
                      >
                        🔐 Reset Password
                      </button>
                      <button
                        onClick={() => handleSendReminder(student)}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-cyan-600 text-white rounded shadow hover:bg-cyan-700 transition"
                        title="Send fee reminder"
                      >
                        🔔 Send Reminder
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatedModal
        open={deleteModal.open}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteModal.studentName}? This action cannot be undone.`}
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, studentId: null, studentName: '' })}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={passwordModal.open}
        onClose={() => setPasswordModal({ open: false, studentId: null, studentName: '', isLoading: false })}
        onSubmit={handleSetPassword}
        studentName={passwordModal.studentName}
        isLoading={passwordModal.isLoading}
      />
    </div>
  )
}
