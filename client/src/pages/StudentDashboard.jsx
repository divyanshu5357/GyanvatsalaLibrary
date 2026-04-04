import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import { authFetch } from '../utils/api'
import EbookFolderBrowser from '../components/ebooks/EbookFolderBrowser'
import EbookFilters from '../components/ebooks/EbookFilters'
import EbookSkeletonGrid from '../components/ebooks/EbookSkeletonGrid'
import EbookReaderModal from '../components/ebooks/EbookReaderModal'
import { buildEbookFolderTree, filterEbooks, getEbookFilterOptions, normalizeEbooks } from '../utils/ebooks'

export default function StudentDashboard() {
  const { currentUser, profile } = useAuth()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const [avatarStatus, setAvatarStatus] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [ebooks, setEbooks] = useState([])
  const [ebooksLoading, setEbooksLoading] = useState(true)
  const [ebooksError, setEbooksError] = useState('')
  const [ebookCategoryTypeFilter, setEbookCategoryTypeFilter] = useState('all')
  const [ebookClassFilter, setEbookClassFilter] = useState('all')
  const [ebookSubjectFilter, setEbookSubjectFilter] = useState('all')
  const [ebookCategoryFilter, setEbookCategoryFilter] = useState('all')
  const [ebookSearch, setEbookSearch] = useState('')
  const [selectedEbook, setSelectedEbook] = useState(null)

  const displayAvatar = useMemo(() => {
    if (avatarInput) return avatarInput
    if (student?.user?.avatar_url) return student.user.avatar_url
    if (currentUser?.user_metadata?.avatar_url) return currentUser.user_metadata.avatar_url
    const seed = encodeURIComponent(profile?.name || currentUser?.email || 'Student')
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
  }, [avatarInput, student, currentUser, profile])

  useEffect(() => {
    if (!currentUser) return
    const fetchStudent = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await authFetch(`/api/student/me?userId=${encodeURIComponent(currentUser.id)}`)
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Failed to load student data')
        }
        const data = await response.json()
        setStudent(data.student)
      } catch (err) {
        console.error('❌ Failed to load student data', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return

    const fetchEbooks = async () => {
      try {
        setEbooksLoading(true)
        setEbooksError('')
        const response = await authFetch('/api/ebooks')
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Failed to load ebooks')
        }
        const data = await response.json()
        setEbooks(normalizeEbooks(data.ebooks || []))
      } catch (err) {
        setEbooksError(err.message)
      } finally {
        setEbooksLoading(false)
      }
    }

    fetchEbooks()
  }, [currentUser])

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPasswordStatus('')
    
    if (!oldPassword || oldPassword.length < 1) {
      setPasswordStatus('Please enter your current password.')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus('New password should be at least 8 characters long.')
      return
    }
    if (oldPassword === newPassword) {
      setPasswordStatus('New password cannot be the same as old password.')
      return
    }
    if (!supabase) {
      setPasswordStatus('Supabase is not configured yet.')
      return
    }

    try {
      // Get current user email
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Unable to get current user')

      // Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })
      
      if (signInError) {
        setPasswordStatus('❌ Current password is incorrect.')
        return
      }

      // Old password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      
      setPasswordStatus('✅ Password updated successfully. Use the new password next login.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordStatus('❌ ' + err.message)
    }
  }

  async function handleAvatarSave(e) {
    e.preventDefault()
    setAvatarStatus('')
    if (!supabase) {
      setAvatarStatus('Supabase is not configured yet.')
      return
    }

    try {
      let publicUrl = avatarInput

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${currentUser.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        publicUrl = urlData.publicUrl
      }

      if (!publicUrl) {
        setAvatarStatus('Add a file or URL first.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      if (updateError) throw updateError
      setAvatarStatus('✅ Profile picture updated. Refresh if it does not show instantly.')
      setAvatarFile(null)
    } catch (err) {
      setAvatarStatus('❌ ' + err.message)
    }
  }

  const detail = (label, value, muted) => (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-base ${muted ? 'text-slate-300' : 'text-white'}`}>{value || '—'}</p>
    </div>
  )

  const formatDate = (value, fallback = '—') => {
    if (!value) return fallback
    return new Date(value).toLocaleDateString()
  }

  const feeDueDate = student?.fee_due_date || student?.next_due
  const feePaidDate = student?.fee_submission_date || student?.last_payment
  const feeStatus = student?.fee_submission_date ? 'Paid' : 'Pending'
  const feeStatusTone = feeStatus === 'Paid' ? 'text-emerald-300' : 'text-amber-300'

  const sections = [
    { id: 'overview', label: 'Dashboard', icon: '🏠' },
    { id: 'account', label: 'Account Details', icon: '👤' },
    { id: 'ebooks', label: 'Study Materials', icon: '📚' },
    { id: 'avatar', label: 'Profile Settings', icon: '🖼️' },
    { id: 'security', label: 'Security', icon: '🔐' },
  ]

  const ebookFilterOptions = useMemo(() => getEbookFilterOptions(ebooks), [ebooks])

  const filteredEbooks = useMemo(
    () => filterEbooks(ebooks, {
      search: ebookSearch,
      categoryTypeFilter: ebookCategoryTypeFilter,
      classFilter: ebookClassFilter,
      subjectFilter: ebookSubjectFilter,
      categoryFilter: ebookCategoryFilter,
    }),
    [ebooks, ebookSearch, ebookCategoryTypeFilter, ebookClassFilter, ebookSubjectFilter, ebookCategoryFilter]
  )

  const ebookFolderTree = useMemo(() => buildEbookFolderTree(filteredEbooks), [filteredEbooks])

  const handleSectionChange = (id) => {
    setActiveSection(id)
    setMobileMenuOpen(false)
  }

  const sectionButtonClass = (id) =>
    `w-full text-left px-3 py-3 rounded-xl border transition ${
      activeSection === id
        ? 'bg-indigo-600/90 border-indigo-400 text-white'
        : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700/80'
    }`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} mobileMenuOpen={mobileMenuOpen} />

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-slate-950/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-72 p-4 bg-slate-900/95 border-r border-slate-700 z-40 transform transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Dashboard Sections</h2>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={sectionButtonClass(section.id)}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="pt-20 pb-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 lg:gap-6">
          <aside className="hidden lg:block glass p-4 rounded-2xl h-fit sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Dashboard Sections</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={sectionButtonClass(section.id)}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <section>
            <div className="card-hover glass rounded-2xl p-4 sm:p-5 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                  <img src={displayAvatar} alt={profile?.name || 'avatar'} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">Student Dashboard</h1>
                  <p className="text-slate-400 text-sm truncate">Welcome back, {profile?.name || currentUser?.email}</p>
                </div>
              </div>
            </div>

            {loading && <div className="p-4 glass rounded-xl">Loading your details…</div>}
            {error && <div className="p-4 glass rounded-xl border border-red-500 text-red-200">{error}</div>}

            {!loading && !error && student && (
              <>
                {activeSection === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="card-hover glass rounded-xl p-4">
                        <p className="text-xs uppercase text-slate-400 tracking-wide">Seat Number</p>
                        <p className="text-2xl font-bold mt-1">{student.seat_number || '—'}</p>
                      </div>
                      <div className="card-hover glass rounded-xl p-4">
                        <p className="text-xs uppercase text-slate-400 tracking-wide">Fee Status</p>
                        <p className={`text-2xl font-bold mt-1 ${feeStatusTone}`}>{feeStatus}</p>
                      </div>
                    </div>

                    <div className="card-hover glass rounded-xl p-4 space-y-3">
                      <h3 className="text-lg font-semibold">Fee Summary</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="card-hover rounded-lg bg-slate-800/70 border border-slate-700 p-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Fee Amount</p>
                          <p className="text-xl font-semibold mt-1">{student.fee_amount ? `₹${student.fee_amount}` : '—'}</p>
                        </div>
                        <div className="card-hover rounded-lg bg-slate-800/70 border border-slate-700 p-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Due Date</p>
                          <p className="text-xl font-semibold mt-1">{formatDate(feeDueDate)}</p>
                        </div>
                        <div className="card-hover rounded-lg bg-slate-800/70 border border-slate-700 p-3 sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Paid On</p>
                          <p className="text-xl font-semibold mt-1">{formatDate(feePaidDate, 'Not paid yet')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'account' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card-hover glass p-4 rounded-xl space-y-3">
                      {detail('Name', student.user?.name || profile?.name || '—')}
                      {detail('Email', student.user?.email || currentUser?.email || '—', true)}
                    </div>
                    <div className="card-hover glass p-4 rounded-xl space-y-3">
                      {detail('Seat Number (locked)', student.seat_number || '—')}
                      <p className="text-xs text-amber-300">Seat number can only be changed by admin.</p>
                      {detail('Joined On', formatDate(student.join_date))}
                    </div>
                  </div>
                )}

                {activeSection === 'ebooks' && (
                  <div className="space-y-4">
                    <div className="card-hover glass rounded-xl p-4 border border-slate-700/60">
                      <h3 className="text-lg font-semibold">Study Materials</h3>
                      <p className="text-sm text-slate-400 mt-1">Navigate a folder-style library for school books, notes, PYQs, and custom learning resources.</p>
                    </div>

                    <EbookFilters
                      search={ebookSearch}
                      setSearch={setEbookSearch}
                      categoryTypeFilter={ebookCategoryTypeFilter}
                      setCategoryTypeFilter={setEbookCategoryTypeFilter}
                      classFilter={ebookClassFilter}
                      setClassFilter={setEbookClassFilter}
                      subjectFilter={ebookSubjectFilter}
                      setSubjectFilter={setEbookSubjectFilter}
                      categoryFilter={ebookCategoryFilter}
                      setCategoryFilter={setEbookCategoryFilter}
                      classOptions={ebookFilterOptions.classOptions}
                      subjectOptions={ebookFilterOptions.subjectOptions}
                      categoryOptions={ebookFilterOptions.categoryOptions}
                    />

                    {ebooksLoading && <EbookSkeletonGrid count={6} />}

                    {!ebooksLoading && ebooksError && (
                      <div className="glass rounded-xl p-4 border border-red-500/50 text-red-200">{ebooksError}</div>
                    )}

                    {!ebooksLoading && !ebooksError && filteredEbooks.length === 0 && (
                      <div className="glass rounded-xl p-6 text-center text-slate-300">No ebooks found for selected filters.</div>
                    )}

                    {!ebooksLoading && !ebooksError && filteredEbooks.length > 0 && (
                      <EbookFolderBrowser tree={ebookFolderTree} onRead={setSelectedEbook} />
                    )}
                  </div>
                )}

                {activeSection === 'avatar' && (
                  <div className="card-hover glass p-4 rounded-xl space-y-4">
                    <h3 className="text-lg font-semibold">Profile Picture</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                        <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-slate-300">Upload a new photo or paste an image URL.</p>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        className="w-full p-2.5 rounded bg-transparent border border-slate-600"
                      />
                      <input
                        value={avatarInput}
                        onChange={(e) => setAvatarInput(e.target.value)}
                        placeholder="Or paste an image URL"
                        className="w-full p-2.5 rounded bg-transparent border border-slate-600"
                      />
                      <button onClick={handleAvatarSave} className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Picture</button>
                      {avatarStatus && <p className="text-xs text-slate-300">{avatarStatus}</p>}
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="card-hover glass p-4 rounded-xl space-y-3">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-2">
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full p-2.5 rounded bg-transparent border border-slate-600"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 8 characters)"
                        className="w-full p-2.5 rounded bg-transparent border border-slate-600"
                      />
                      <button className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 rounded-lg hover:bg-emerald-700">Update Password</button>
                      {passwordStatus && <p className="text-xs text-slate-300">{passwordStatus}</p>}
                    </form>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <EbookReaderModal ebook={selectedEbook} onClose={() => setSelectedEbook(null)} />
    </div>
  )
}
