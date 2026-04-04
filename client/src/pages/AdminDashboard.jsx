import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import CreateStudentModal from '../components/CreateStudentModal'
import StudentsList from '../components/StudentsList'
import { DefaultersList, DueSoonList, MonthlyEarnings, AnalyticsOverview } from '../components/AnalyticsCards'
import AdminEbookManager from '../components/ebooks/AdminEbookManager'
import { useAlert } from '../contexts/AlertContext'
import { authFetch } from '../utils/api'

export default function AdminDashboard() {
  const { showAlert } = useAlert()
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [allStudents, setAllStudents] = useState([])
  const [metrics, setMetrics] = useState({ totalStudents: 0, totalSeats: 0, occupiedSeats: 0, pendingFees: 0 })
  const [totalSeatsOverride, setTotalSeatsOverride] = useState(null)
  const [seatsInput, setSeatsInput] = useState('')
  const [feeFilter, setFeeFilter] = useState('all')
  const location = useLocation()
  const navigate = useNavigate()

  const tab = (location.pathname.split('/')[2] || 'students')

  const handleStudentCreated = () => {
    setOpen(false)
    setRefreshKey(prev => prev + 1)
    fetchAllStudents()
  }

  const handleMetrics = (m) => {
    setMetrics(m)
    fetchAllStudents()
  }

  // Fetch all students for Due Soon and Defaulters lists
  const fetchAllStudents = async () => {
    try {
      const response = await authFetch('/api/admin/students')
      if (response.ok) {
        const data = await response.json()
        setAllStudents(data.students || [])
        console.log('✅ All students fetched for analytics:', (data.students || []).length)
      } else {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to fetch students')
      }
    } catch (err) {
      console.error('❌ Error fetching all students:', err)
    }
  }

  React.useEffect(() => {
    fetchAllStudents()
  }, [refreshKey])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('library_total_seats')
      if (raw) {
        const n = Number(raw)
        if (!Number.isNaN(n)) {
          setTotalSeatsOverride(n)
          setSeatsInput(String(n))
        }
      }
    } catch (e) {}
  }, [])

  const isOverview = tab === 'overview'
  const isStudents = tab === 'students'
  const isSeats = tab === 'seats'
  const isFees = tab === 'fees'
  const isEbooks = tab === 'ebooks'
  const isDefaulters = tab === 'defaulters'
  const isDueSoon = tab === 'due-soon'
  const isEarnings = tab === 'earnings'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navbar with menu toggle */}
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />

      {/* Sidebar (menu drawer on mobile/tablet) */}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content Area - Adjusted for navbar height and sidebar on desktop */}
      <main className="pt-20 lg:pt-20 lg:ml-64 px-3 sm:px-4 lg:px-6 pb-8">
        {/* Close mobile menu when clicking content */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-0" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold capitalize">
              {tab === 'students' ? 'Admin Dashboard' : tab === 'defaulters' ? 'Defaulters' : tab === 'due-soon' ? 'Due Soon' : tab === 'earnings' ? 'Monthly Earnings' : tab}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {tab === 'students' && 'Manage all students and their information'}
              {tab === 'fees' && 'View and manage student fees'}
              {tab === 'ebooks' && 'Upload PDF or external study links and manage all ebooks'}
              {tab === 'earnings' && 'Monthly fee collection insights'}
              {tab === 'due-soon' && 'Students with upcoming fee due dates'}
              {tab === 'defaulters' && 'Students with overdue payments'}
            </p>
          </div>

          {/* Create Button - Full width on mobile */}
          {isStudents && (
            <button
              onClick={() => setOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-lg font-medium transition active:scale-95 shadow-lg"
            >
              ➕ Add Student
            </button>
          )}
        </div>

        {/* Vertical Tab Navigation - Stack on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          <button
            onClick={() => navigate('/admin/students')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isStudents ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📚 Students
          </button>
          <button
            onClick={() => navigate('/admin/ebooks')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isEbooks ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📘 Ebooks
          </button>
          <button
            onClick={() => navigate('/admin/fees')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isFees ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💳 Fees
          </button>
          <button
            onClick={() => navigate('/admin/earnings')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isEarnings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💰 Earnings
          </button>
          <button
            onClick={() => navigate('/admin/due-soon')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isDueSoon ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ⏰ Due Soon
          </button>
          <button
            onClick={() => navigate('/admin/defaulters')}
            className={`px-3 py-2.5 rounded-lg transition text-xs sm:text-sm font-medium ${
              isDefaulters ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ⚠️ Defaults
          </button>
        </div>

          {(isStudents) && (
            <>
              <section className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-hover glass p-4 rounded">
                  <div className="text-sm text-slate-400">Total Students</div>
                  <div className="text-2xl font-bold">{metrics.totalStudents ?? 0}</div>
                </div>
                <div className="card-hover glass p-4 rounded">
                  <div className="text-sm text-slate-400">Total Seats</div>
                  <div className="text-2xl font-bold">{metrics.totalSeats ?? 0}</div>
                </div>
                <div className="card-hover glass p-4 rounded">
                  <div className="text-sm text-slate-400">Occupied Seats</div>
                  <div className="text-2xl font-bold">{metrics.occupiedSeats ?? 0}</div>
                </div>
                <div className="card-hover glass p-4 rounded">
                  <div className="text-sm text-slate-400">Pending Fees</div>
                  <div className={`text-2xl font-bold ${metrics.pendingFees > 0 ? 'text-amber-300' : ''}`}>{metrics.pendingFees ?? 0}</div>
                </div>
              </section>

              <section className="card-hover mt-8 glass rounded">
                <StudentsList key={refreshKey} onMetrics={handleMetrics} />
              </section>
            </>
          )}

          {isSeats && (
            <section className="card-hover mt-8 glass rounded p-6 space-y-3">
              <h2 className="text-xl font-semibold">Seats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="card-hover p-4 rounded bg-slate-800/40">
                  <div className="text-sm text-slate-400">Total seats</div>
                  <div className="text-2xl font-bold">{(totalSeatsOverride ?? metrics.totalSeats) ?? 0}</div>
                </div>
                <div className="card-hover p-4 rounded bg-slate-800/40">
                  <div className="text-sm text-slate-400">Occupied</div>
                  <div className="text-2xl font-bold">{metrics.occupiedSeats ?? 0}</div>
                </div>
                <div className="card-hover p-4 rounded bg-slate-800/40">
                  <div className="text-sm text-slate-400">Vacant</div>
                  <div className="text-2xl font-bold">{Math.max(0, (totalSeatsOverride ?? metrics.totalSeats) - (metrics.occupiedSeats ?? 0))}</div>
                </div>
                <div className="card-hover p-4 rounded bg-slate-800/40">
                  <div className="text-sm text-slate-400">Editable</div>
                  <div className="flex gap-2 mt-2">
                    <input value={seatsInput} onChange={(e) => setSeatsInput(e.target.value)} className="w-28 p-2 rounded bg-transparent border text-white text-sm" placeholder="e.g. 50" />
                    <button onClick={() => {
                      const n = Number(seatsInput)
                      if (Number.isNaN(n) || n < 0) {
                        showAlert({
                          title: 'Invalid seat value',
                          message: 'Please enter a valid non-negative number.',
                          type: 'warning',
                        })
                        return
                      }
                      setTotalSeatsOverride(n)
                      setMetrics(prev => ({ ...prev, totalSeats: n }))
                      try { localStorage.setItem('library_total_seats', String(n)) } catch(e){}
                    }} className="px-3 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-sm">Save</button>
                    <button onClick={() => { setSeatsInput(''); setTotalSeatsOverride(null); try{localStorage.removeItem('library_total_seats')}catch(e){}; }} className="px-3 py-2 bg-slate-700 rounded text-sm">Reset</button>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 mt-3">You can edit the total number of seats here. Assigned seats are still managed per-student in the Students tab.</p>
              <button onClick={() => navigate('/admin/students')} className="text-indigo-300 text-sm underline">Go to Students</button>
            </section>
          )}

          {isFees && (
            <section className="card-hover mt-8 glass rounded p-6 space-y-3">
              <h2 className="text-xl font-semibold">Fees</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-slate-300 max-w-xl">Filter students by fee status to quickly find who has paid, who has upcoming dues, and who is overdue.</p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-300">Show</label>
                  <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} className="p-2 rounded bg-slate-800 border text-sm">
                    <option value="all">All students</option>
                    <option value="paid">Paid</option>
                    <option value="due">Due (not yet paid)</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                {/* reuse StudentsList but only for filtered view; avoid changing metrics */}
                <StudentsList key={`fees-${feeFilter}`} feeFilter={feeFilter} useMetrics={false} onMetrics={() => {}} />
              </div>
            </section>
          )}

          {isEbooks && (
            <section className="mt-8">
              <AdminEbookManager />
            </section>
          )}

          {isEarnings && (
            <section className="mt-8 space-y-6">
              <MonthlyEarnings />
            </section>
          )}

          {isDueSoon && (
            <section className="mt-8 space-y-6">
              <DueSoonList students={allStudents} />
            </section>
          )}
          {isDefaulters && (
            <section className="mt-8 space-y-6">
              <DefaultersList students={allStudents} />
            </section>
          )}
        </main>

      <CreateStudentModal open={open} onClose={() => setOpen(false)} onSuccess={handleStudentCreated} />
    </div>
  )
}
