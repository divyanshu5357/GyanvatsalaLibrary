import React, { useState } from 'react'
import { useAlert } from '../contexts/AlertContext'
import { authFetch } from '../utils/api'

export default function CreateStudentModal({ open, onClose, onSuccess }) {
  const { showAlert } = useAlert()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [feeSubmissionDate, setFeeSubmissionDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [createdStudent, setCreatedStudent] = useState(null)
  const [error, setError] = useState(null)

  if (!open) return null

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Call backend API to create student
      const response = await authFetch('/api/admin/create-student', {
        method: 'POST',
        body: JSON.stringify({
          email,
          name,
          phone,
          seatNumber,
          feeAmount,
          joinDate,
          dueDate,
          feeSubmissionDate,
        }),
      })

      if (!response.ok) {
        let message = `Failed to create student (status ${response.status})`
        try {
          const errorData = await response.json()
          if (errorData?.error) message = errorData.error
          else if (typeof errorData === 'string') message = errorData
        } catch (_) {
          try {
            const text = await response.text()
            if (text) message = text
          } catch (_e) {
            // ignore
          }
        }
        throw new Error(message)
      }

      const result = await response.json()
      setCreatedStudent(result.student)
      showAlert({
        title: 'Student Created! 🎉',
        message: `Password: ${result.student.tempPassword}`,
        type: 'success',
        duration: 5000,
      })
    } catch (err) {
      console.error('Error creating student:', err)
      setError(err.message)
      showAlert({
        title: 'Creation Failed',
        message: err.message,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !createdStudent && onClose()} />
      <div 
        className="relative w-full max-w-2xl bg-slate-800 p-6 rounded-lg glass"
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <h3 className="text-xl font-bold mb-4 animate-slideInUp">Create Student</h3>
        {!createdStudent ? (
          <form onSubmit={handleCreate} className="space-y-3">
            {error && <div className="p-3 bg-red-900/30 border border-red-500 rounded text-red-200">{error}</div>}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full p-2 rounded bg-transparent border" required />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 rounded bg-transparent border" required type="email" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 rounded bg-transparent border" />
            <input value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder="Seat Number" className="w-full p-2 rounded bg-transparent border" />
            <input value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="Fee Amount" className="w-full p-2 rounded bg-transparent border" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm text-slate-300 space-y-1">
                <span>Join Date</span>
                <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="w-full p-2 rounded bg-transparent border" />
              </label>
              <label className="text-sm text-slate-300 space-y-1">
                <span>Fee Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 rounded bg-transparent border" />
              </label>
              <label className="text-sm text-slate-300 space-y-1">
                <span>Fee Submission Date</span>
                <input type="date" value={feeSubmissionDate} onChange={(e) => setFeeSubmissionDate(e.target.value)} className="w-full p-2 rounded bg-transparent border" />
              </label>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 rounded">Cancel</button>
              <button disabled={saving} className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create Student'}</button>
            </div>
          </form>
        ) : (
          <div className="animate-slideInUp" style={{ animation: 'slideInUp 0.4s ease-out' }}>
            <div className="p-4 bg-green-900/30 border border-green-500 rounded mb-4 animate-scaleIn" style={{ animation: 'scaleIn 0.4s ease-out' }}>
              <p className="text-green-200 font-bold mb-2">✅ Student Created Successfully!</p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {createdStudent.email}</p>
                <p><strong>Name:</strong> {createdStudent.name}</p>
                <p><strong>Phone:</strong> {createdStudent.phone || 'N/A'}</p>
                <p><strong>Seat:</strong> {createdStudent.seatNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-900/30 border border-blue-500 rounded mb-4 animate-scaleIn" style={{ animation: 'scaleIn 0.4s ease-out 0.1s both' }}>
              <p className="text-blue-200 font-bold mb-2">⚠️ Temporary Password:</p>
              <p className="font-mono text-sm bg-slate-900 p-2 rounded break-all">{createdStudent.tempPassword}</p>
              <p className="text-xs text-blue-300 mt-2">Share this with the student. They can change it after login.</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => { 
                  setCreatedStudent(null)
                  setName('')
                  setEmail('')
                  setPhone('')
                  setSeatNumber('')
                  setFeeAmount('')
                  setJoinDate('')
                  setDueDate('')
                  setFeeSubmissionDate('')
                }} 
                className="px-3 py-1 bg-white/5 rounded hover:bg-white/10"
              >
                Create Another
              </button>
              <button 
                onClick={() => {
                  setCreatedStudent(null)
                  setName('')
                  setEmail('')
                  setPhone('')
                  setSeatNumber('')
                  setFeeAmount('')
                  setJoinDate('')
                  setDueDate('')
                  setFeeSubmissionDate('')
                  setError(null)
                  if (onSuccess) onSuccess()
                  onClose()
                }} 
                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
