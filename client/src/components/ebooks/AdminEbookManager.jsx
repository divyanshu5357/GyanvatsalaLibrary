import React, { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../utils/api'
import { uploadFileToCloudinary, isPdfUrl } from '../../utils/cloudinaryUpload'
import {
  CATEGORY_TYPE_OPTIONS,
  SCHOOL_CLASS_OPTIONS,
  SCHOOL_SUBJECT_OPTIONS,
  buildEbookFolderTree,
  filterEbooks,
  getEbookFilterOptions,
  getEbookLocationLabel,
  normalizeEbook,
  normalizeEbooks,
  sortClassLevels,
  sortSubjects,
} from '../../utils/ebooks'
import { useAlert } from '../../contexts/AlertContext'
import AnimatedModal from '../AnimatedModal'
import EbookFilters from './EbookFilters'
import EbookFolderBrowser from './EbookFolderBrowser'
import EbookSkeletonGrid from './EbookSkeletonGrid'
import EbookReaderModal from './EbookReaderModal'

const INITIAL_FORM = {
  title: '',
  category_type: 'school',
  class: '10',
  subject: 'Math',
  custom_category: '',
  description: '',
  upload_type: 'cloudinary',
  file_url: '',
  thumbnail_url: '',
  file_public_id: '',
  thumbnail_public_id: '',
}

export default function AdminEbookManager() {
  const { showAlert } = useAlert()
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('card')
  const [search, setSearch] = useState('')
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [selectedEbook, setSelectedEbook] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, ebook: null, askCloudinary: false })
  const [opStatus, setOpStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    fetchEbooks()
  }, [])

  async function fetchEbooks() {
    try {
      setLoading(true)
      setError('')

      const response = await authFetch('/api/ebooks')
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to fetch ebooks. Run ebooks-setup.sql in Supabase if table is missing.')
      }

      const data = await response.json()
      setEbooks(normalizeEbooks(data.ebooks || []))
      setOpStatus({ type: 'success', message: 'Ebooks loaded successfully.' })
    } catch (err) {
      setError(err.message)
      setOpStatus({ type: 'error', message: err.message })
      showAlert({
        title: 'Ebook load failed',
        message: err.message,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = useMemo(() => getEbookFilterOptions(ebooks), [ebooks])

  const filteredEbooks = useMemo(
    () => filterEbooks(ebooks, { search, categoryTypeFilter, classFilter, subjectFilter, categoryFilter }),
    [ebooks, search, categoryTypeFilter, classFilter, subjectFilter, categoryFilter]
  )

  const folderTree = useMemo(() => buildEbookFolderTree(filteredEbooks), [filteredEbooks])

  const stats = useMemo(() => ({
    total: ebooks.length,
    school: ebooks.filter((ebook) => ebook.category_type === 'school').length,
    other: ebooks.filter((ebook) => ebook.category_type === 'other').length,
  }), [ebooks])

  const classSelectOptions = useMemo(
    () => sortClassLevels(Array.from(new Set([...SCHOOL_CLASS_OPTIONS, form.class].filter(Boolean)))),
    [form.class]
  )

  const subjectSelectOptions = useMemo(
    () => sortSubjects(Array.from(new Set([...SCHOOL_SUBJECT_OPTIONS, form.subject].filter(Boolean)))),
    [form.subject]
  )

  function resetForm() {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setPdfFile(null)
    setThumbnailFile(null)
  }

  function handleCategoryTypeChange(nextType) {
    setForm((prev) => ({
      ...prev,
      category_type: nextType,
      class: nextType === 'school' ? prev.class || INITIAL_FORM.class : prev.class,
      subject: nextType === 'school' ? prev.subject || INITIAL_FORM.subject : prev.subject,
      custom_category: nextType === 'other' ? prev.custom_category : prev.custom_category,
    }))
  }

  function onEdit(ebook) {
    const item = normalizeEbook(ebook)

    setEditingId(item.id)
    setForm({
      title: item.title || '',
      category_type: item.category_type || 'school',
      class: String(item.class || INITIAL_FORM.class),
      subject: item.subject || INITIAL_FORM.subject,
      custom_category: item.custom_category || '',
      description: item.description || '',
      upload_type: item.upload_type || 'external',
      file_url: item.file_url || '',
      thumbnail_url: item.thumbnail_url || '',
      file_public_id: item.file_public_id || '',
      thumbnail_public_id: item.thumbnail_public_id || '',
    })
    setPdfFile(null)
    setThumbnailFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onDelete(ebook) {
    setDeleteModal({
      open: true,
      ebook: normalizeEbook(ebook),
      askCloudinary: ebook.upload_type === 'cloudinary',
    })
  }

  async function deleteEbook({ ebook, deleteCloudinary }) {
    if (!ebook) return

    try {
      const response = await authFetch(`/api/admin/ebooks/${ebook.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ deleteCloudinary }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to delete ebook')
      }

      setEbooks((prev) => prev.filter((item) => item.id !== ebook.id))
      if (editingId === ebook.id) resetForm()
      setOpStatus({ type: 'success', message: `Deleted "${ebook.title}" successfully.` })
      showAlert({
        title: 'Ebook deleted',
        message: `"${ebook.title}" removed successfully.`,
        type: 'success',
      })
    } catch (err) {
      setOpStatus({ type: 'error', message: err.message })
      showAlert({
        title: 'Delete failed',
        message: err.message,
        type: 'error',
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      showAlert({
        title: 'Missing title',
        message: 'Please provide a title for the ebook.',
        type: 'warning',
      })
      return
    }

    if (form.category_type === 'school' && (!form.class || !form.subject.trim())) {
      showAlert({
        title: 'School details required',
        message: 'Please select both class and subject for school materials.',
        type: 'warning',
      })
      return
    }

    if (form.category_type === 'other' && !form.custom_category.trim()) {
      showAlert({
        title: 'Category required',
        message: 'Please enter a category for other study materials.',
        type: 'warning',
      })
      return
    }

    if (form.upload_type === 'external') {
      if (!form.file_url.trim()) {
        showAlert({
          title: 'External URL required',
          message: 'Please provide a public PDF URL.',
          type: 'warning',
        })
        return
      }

      if (!isPdfUrl(form.file_url)) {
        showAlert({
          title: 'Invalid file type',
          message: 'Only PDF links are allowed.',
          type: 'warning',
        })
        return
      }
    }

    if (form.upload_type === 'cloudinary' && !editingId && !pdfFile) {
      showAlert({
        title: 'PDF required',
        message: 'Please upload a PDF file.',
        type: 'warning',
      })
      return
    }

    try {
      setSaving(true)
      setOpStatus({ type: 'info', message: 'Uploading and saving ebook, please wait...' })

      const payload = {
        ...form,
        class: form.category_type === 'school' ? form.class : '',
        subject: form.category_type === 'school' ? form.subject : '',
        custom_category: form.category_type === 'other' ? form.custom_category : '',
      }

      if (form.upload_type === 'cloudinary' && pdfFile) {
        const uploadedPdf = await uploadFileToCloudinary(pdfFile, {
          resourceType: 'raw',
          folder: 'library-management/ebooks/pdfs',
        })
        payload.file_url = uploadedPdf.secureUrl
        payload.file_public_id = uploadedPdf.publicId
      }

      if (thumbnailFile) {
        const uploadedThumb = await uploadFileToCloudinary(thumbnailFile, {
          resourceType: 'image',
          folder: 'library-management/ebooks/thumbnails',
        })
        payload.thumbnail_url = uploadedThumb.secureUrl
        payload.thumbnail_public_id = uploadedThumb.publicId
      }

      const endpoint = editingId ? `/api/admin/ebooks/${editingId}` : '/api/admin/ebooks'
      const method = editingId ? 'PATCH' : 'POST'

      const response = await authFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to save ebook')
      }

      const data = await response.json()
      const nextEbook = normalizeEbook(data.ebook)

      if (editingId) {
        setEbooks((prev) => prev.map((item) => (item.id === editingId ? nextEbook : item)))
        setOpStatus({ type: 'success', message: 'Book updated successfully.' })
        showAlert({
          title: 'Ebook updated',
          message: 'Changes saved successfully.',
          type: 'success',
        })
      } else {
        setEbooks((prev) => [nextEbook, ...prev])
        setOpStatus({ type: 'success', message: 'Ebook uploaded and added successfully.' })
        showAlert({
          title: 'Ebook added',
          message: 'New ebook is now available for students.',
          type: 'success',
        })
      }

      resetForm()
    } catch (err) {
      setOpStatus({ type: 'error', message: err.message })
      showAlert({
        title: 'Save failed',
        message: err.message,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="card-hover glass rounded-2xl p-4 border border-slate-700/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Manage Study Materials</h2>
            <p className="text-sm text-slate-400 mt-1">Create structured folders for school books and custom learning resources.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'card' ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              📁 Folder View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'table' ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              📋 Table View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card-hover rounded-xl border border-slate-700/70 bg-slate-900/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total Books</p>
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
          </div>
          <div className="card-hover rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-indigo-200">School</p>
            <p className="text-2xl font-semibold mt-1">{stats.school}</p>
          </div>
          <div className="card-hover rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-emerald-200">Other Study Materials</p>
            <p className="text-2xl font-semibold mt-1">{stats.other}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Title"
            className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 xl:col-span-2"
            required
          />

          <select
            value={form.category_type}
            onChange={(event) => handleCategoryTypeChange(event.target.value)}
            className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
          >
            {CATEGORY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={form.upload_type}
            onChange={(event) => setForm((prev) => ({ ...prev, upload_type: event.target.value }))}
            className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
          >
            <option value="cloudinary">Upload PDF (Cloudinary)</option>
            <option value="external">External Link (PDF only)</option>
          </select>

          {form.category_type === 'school' ? (
            <>
              <select
                value={form.class}
                onChange={(event) => setForm((prev) => ({ ...prev, class: event.target.value }))}
                className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
                required
              >
                {classSelectOptions.map((option) => (
                  <option key={option} value={option}>
                    Class {option}
                  </option>
                ))}
              </select>

              <select
                value={form.subject}
                onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
                required
              >
                {subjectSelectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <input
              value={form.custom_category}
              onChange={(event) => setForm((prev) => ({ ...prev, custom_category: event.target.value }))}
              placeholder="Enter category name (SSC, BCA Semester 1, PYQs...)"
              className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 md:col-span-2"
              required
            />
          )}

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description (optional)"
            className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 min-h-[104px] md:col-span-2 xl:col-span-4"
          />

          {form.upload_type === 'cloudinary' ? (
            <div className="md:col-span-2 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">PDF file</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                  className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
                />
                {form.file_url && <p className="text-xs text-slate-400 truncate">Current file: {form.file_url}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Thumbnail image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
                  className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600"
                />
                {form.thumbnail_url && <p className="text-xs text-slate-400 truncate">Current thumbnail: {form.thumbnail_url}</p>}
              </div>
            </div>
          ) : (
            <>
              <input
                value={form.file_url}
                onChange={(event) => setForm((prev) => ({ ...prev, file_url: event.target.value }))}
                placeholder="Public PDF URL (.pdf)"
                className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 md:col-span-2 xl:col-span-4"
              />
              <input
                value={form.thumbnail_url}
                onChange={(event) => setForm((prev) => ({ ...prev, thumbnail_url: event.target.value }))}
                placeholder="Thumbnail URL (optional)"
                className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 md:col-span-2 xl:col-span-4"
              />
            </>
          )}

          {form.category_type === 'other' && (
            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-2 text-xs text-slate-300">
              {['Graduation Courses', 'SSC Preparation', 'UPSC', 'Railway', 'PYQs', 'Notes'].map((label) => (
                <span key={label} className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving & uploading...' : editingId ? 'Update Ebook' : 'Add Ebook'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {!!opStatus.message && (
            <div
              className={`md:col-span-2 xl:col-span-4 rounded-lg px-3 py-2 text-sm border animate-fadeIn ${
                opStatus.type === 'error'
                  ? 'bg-red-500/15 border-red-400/40 text-red-200'
                  : opStatus.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                    : 'bg-indigo-500/15 border-indigo-400/40 text-indigo-200'
              }`}
            >
              {opStatus.message}
            </div>
          )}
        </form>
      </div>

      <EbookFilters
        search={search}
        setSearch={setSearch}
        categoryTypeFilter={categoryTypeFilter}
        setCategoryTypeFilter={setCategoryTypeFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        classOptions={filterOptions.classOptions}
        subjectOptions={filterOptions.subjectOptions}
        categoryOptions={filterOptions.categoryOptions}
      />

      {loading && <EbookSkeletonGrid count={6} />}

      {!loading && error && (
        <div className="card-hover glass rounded-xl p-4 border border-red-500/50 text-red-200">{error}</div>
      )}

      {!loading && !error && filteredEbooks.length === 0 && (
        <div className="card-hover glass rounded-xl p-6 text-slate-300 text-center">No study materials found for the current filters.</div>
      )}

      {!loading && !error && filteredEbooks.length > 0 && viewMode === 'card' && (
        <EbookFolderBrowser
          tree={folderTree}
          onRead={(item) => setSelectedEbook(item)}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions
        />
      )}

      {!loading && !error && filteredEbooks.length > 0 && viewMode === 'table' && (
        <div className="card-hover glass rounded-xl overflow-x-auto border border-slate-700/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Folder</th>
                <th className="p-3 text-left">Upload Type</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEbooks.map((ebook) => {
                const item = normalizeEbook(ebook)

                return (
                  <tr key={item.id} className="border-b border-slate-700/60 hover:bg-slate-800/40">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
                      </div>
                    </td>
                    <td className="p-3 capitalize">{item.category_type}</td>
                    <td className="p-3 text-slate-300">{getEbookLocationLabel(item)}</td>
                    <td className="p-3 capitalize">{item.upload_type}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setSelectedEbook(item)} className="px-2 py-1 rounded bg-indigo-600 text-xs">Read</button>
                        <button type="button" onClick={() => onEdit(item)} className="px-2 py-1 rounded bg-slate-700 text-xs">Edit</button>
                        <button type="button" onClick={() => onDelete(item)} className="px-2 py-1 rounded bg-red-600 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <EbookReaderModal ebook={selectedEbook} onClose={() => setSelectedEbook(null)} />

      <AnimatedModal
        open={deleteModal.open}
        title="Delete ebook"
        message={deleteModal.askCloudinary
          ? `Delete "${deleteModal.ebook?.title}"? (Cloudinary file will also be deleted.)`
          : `Delete "${deleteModal.ebook?.title}"? This cannot be undone.`}
        isDangerous
        onCancel={() => setDeleteModal({ open: false, ebook: null, askCloudinary: false })}
        onConfirm={async () => {
          const payload = { ...deleteModal }
          setDeleteModal({ open: false, ebook: null, askCloudinary: false })
          await deleteEbook({
            ebook: payload.ebook,
            deleteCloudinary: payload.askCloudinary,
          })
        }}
      />
    </section>
  )
}
