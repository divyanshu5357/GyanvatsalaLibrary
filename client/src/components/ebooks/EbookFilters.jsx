import React from 'react'

export default function EbookFilters({
  search,
  setSearch,
  categoryTypeFilter = 'all',
  setCategoryTypeFilter,
  classFilter,
  setClassFilter,
  subjectFilter,
  setSubjectFilter,
  categoryFilter,
  setCategoryFilter,
  classOptions = [],
  subjectOptions = [],
  categoryOptions = [],
}) {
  const schoolMode = categoryTypeFilter === 'school'
  const otherMode = categoryTypeFilter === 'other'

  const handleCategoryTypeChange = (event) => {
    const nextValue = event.target.value
    setCategoryTypeFilter?.(nextValue)

    if (nextValue === 'school') {
      setCategoryFilter?.('all')
    } else if (nextValue === 'other') {
      setClassFilter?.('all')
      setSubjectFilter?.('all')
    }
  }

  return (
    <div className="glass rounded-2xl p-4 border border-slate-700/60 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search title, subject or category"
        className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 text-sm xl:col-span-2"
      />

      <select
        value={categoryTypeFilter}
        onChange={handleCategoryTypeChange}
        className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 text-sm"
      >
        <option value="all">All Sections</option>
        <option value="school">School</option>
        <option value="other">Other Study Materials</option>
      </select>

      <select
        value={classFilter}
        onChange={(event) => setClassFilter(event.target.value)}
        disabled={otherMode}
        className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 text-sm disabled:opacity-50"
      >
        <option value="all">All Classes</option>
        {classOptions.map((option) => (
          <option key={option} value={option}>
            Class {option}
          </option>
        ))}
      </select>

      <select
        value={subjectFilter}
        onChange={(event) => setSubjectFilter(event.target.value)}
        disabled={otherMode}
        className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 text-sm disabled:opacity-50"
      >
        <option value="all">All Subjects</option>
        {subjectOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={categoryFilter}
        onChange={(event) => setCategoryFilter(event.target.value)}
        disabled={schoolMode}
        className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-600 text-sm disabled:opacity-50"
      >
        <option value="all">All Categories</option>
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
