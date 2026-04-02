export const CATEGORY_TYPE_OPTIONS = [
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other Study Materials' },
]

export const SCHOOL_CLASS_OPTIONS = ['9', '10', '11', '12']
export const SCHOOL_SUBJECT_OPTIONS = ['Math', 'Science', 'English', 'Others']

const CLASS_SORT_ORDER = ['6', '7', '8', '9', '10', '11', '12']

function normalizeText(value) {
  const text = String(value || '').trim()
  return text || ''
}

function createSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function countNodeEbooks(node) {
  const childCount = (node.children || []).reduce((sum, child) => sum + countNodeEbooks(child), 0)
  return childCount + (node.ebooks?.length || 0)
}

export function inferEbookCategoryType(ebook = {}) {
  const explicitType = normalizeText(ebook.category_type).toLowerCase()
  if (explicitType === 'other') return 'other'
  if (explicitType === 'school') return 'school'
  if (normalizeText(ebook.custom_category)) return 'other'
  return 'school'
}

export function normalizeEbook(ebook = {}) {
  const categoryType = inferEbookCategoryType(ebook)
  const classLevel = normalizeText(ebook.class)
  const subject = normalizeText(ebook.subject)
  const customCategory = normalizeText(ebook.custom_category) || (categoryType === 'other' ? subject : '')

  return {
    ...ebook,
    category_type: categoryType,
    class: categoryType === 'school' ? classLevel || null : null,
    subject: categoryType === 'school' ? subject || 'General' : null,
    custom_category: categoryType === 'other' ? customCategory || 'General' : null,
  }
}

export function normalizeEbooks(ebooks = []) {
  return ebooks.map(normalizeEbook)
}

export function getEbookPrimaryLabel(ebook = {}) {
  const item = normalizeEbook(ebook)
  return item.category_type === 'school' ? item.subject : item.custom_category
}

export function getEbookLocationLabel(ebook = {}) {
  const item = normalizeEbook(ebook)

  if (item.category_type === 'school') {
    return `School / Class ${item.class || 'Unknown'} / ${item.subject}`
  }

  return `Other / ${item.custom_category}`
}

export function sortClassLevels(values = []) {
  return [...values].sort((left, right) => {
    const leftIndex = CLASS_SORT_ORDER.indexOf(String(left))
    const rightIndex = CLASS_SORT_ORDER.indexOf(String(right))

    if (leftIndex === -1 && rightIndex === -1) return String(left).localeCompare(String(right))
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

export function sortSubjects(values = []) {
  return [...values].sort((left, right) => {
    const leftIndex = SCHOOL_SUBJECT_OPTIONS.indexOf(left)
    const rightIndex = SCHOOL_SUBJECT_OPTIONS.indexOf(right)

    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

export function getEbookFilterOptions(ebooks = []) {
  const normalized = normalizeEbooks(ebooks)
  const classOptions = sortClassLevels(
    Array.from(new Set(normalized.filter((ebook) => ebook.category_type === 'school' && ebook.class).map((ebook) => ebook.class)))
  )
  const subjectOptions = sortSubjects(
    Array.from(new Set(normalized.filter((ebook) => ebook.category_type === 'school' && ebook.subject).map((ebook) => ebook.subject)))
  )
  const categoryOptions = Array.from(
    new Set(normalized.filter((ebook) => ebook.category_type === 'other' && ebook.custom_category).map((ebook) => ebook.custom_category))
  ).sort((left, right) => left.localeCompare(right))

  return { classOptions, subjectOptions, categoryOptions }
}

export function matchesEbookFilters(ebook = {}, filters = {}) {
  const item = normalizeEbook(ebook)
  const search = normalizeText(filters.search).toLowerCase()
  const classFilter = normalizeText(filters.classFilter)
  const subjectFilter = normalizeText(filters.subjectFilter)
  const categoryFilter = normalizeText(filters.categoryFilter)
  const categoryTypeFilter = normalizeText(filters.categoryTypeFilter || 'all').toLowerCase()

  const matchesCategoryType = categoryTypeFilter === 'all' ? true : item.category_type === categoryTypeFilter
  const matchesClass = classFilter === 'all' || !classFilter ? true : item.class === classFilter
  const matchesSubject = subjectFilter === 'all' || !subjectFilter ? true : item.subject === subjectFilter
  const matchesCategory = categoryFilter === 'all' || !categoryFilter ? true : item.custom_category === categoryFilter
  const searchHaystack = [
    item.title,
    item.description,
    item.subject,
    item.custom_category,
    item.class ? `class ${item.class}` : '',
    getEbookLocationLabel(item),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const matchesSearch = search ? searchHaystack.includes(search) : true

  if (!matchesCategoryType || !matchesSearch) return false
  if (item.category_type === 'school') return matchesClass && matchesSubject && (categoryFilter === 'all' || !categoryFilter)
  return matchesCategory && (classFilter === 'all' || !classFilter) && (subjectFilter === 'all' || !subjectFilter)
}

export function filterEbooks(ebooks = [], filters = {}) {
  return normalizeEbooks(ebooks).filter((ebook) => matchesEbookFilters(ebook, filters))
}

export function buildEbookFolderTree(ebooks = []) {
  const normalized = normalizeEbooks(ebooks)
  const schoolMap = new Map()
  const otherMap = new Map()

  normalized.forEach((ebook) => {
    if (ebook.category_type === 'school') {
      const classKey = ebook.class || 'Unknown'
      const subjectKey = ebook.subject || 'General'

      if (!schoolMap.has(classKey)) {
        schoolMap.set(classKey, new Map())
      }

      const subjectMap = schoolMap.get(classKey)
      if (!subjectMap.has(subjectKey)) {
        subjectMap.set(subjectKey, [])
      }

      subjectMap.get(subjectKey).push(ebook)
      return
    }

    const categoryKey = ebook.custom_category || 'General'
    if (!otherMap.has(categoryKey)) {
      otherMap.set(categoryKey, [])
    }
    otherMap.get(categoryKey).push(ebook)
  })

  const schoolChildren = sortClassLevels(Array.from(schoolMap.keys())).map((classKey) => {
    const subjectMap = schoolMap.get(classKey)
    const children = sortSubjects(Array.from(subjectMap.keys())).map((subjectKey) => ({
      id: `school-${createSlug(classKey)}-${createSlug(subjectKey)}`,
      label: subjectKey,
      description: `${subjectMap.get(subjectKey).length} book${subjectMap.get(subjectKey).length === 1 ? '' : 's'}`,
      ebooks: [...subjectMap.get(subjectKey)].sort((left, right) => left.title.localeCompare(right.title)),
      children: [],
    }))

    return {
      id: `school-${createSlug(classKey)}`,
      label: `Class ${classKey}`,
      description: `${children.length} subject${children.length === 1 ? '' : 's'}`,
      ebooks: [],
      children,
    }
  })

  const otherChildren = Array.from(otherMap.keys())
    .sort((left, right) => left.localeCompare(right))
    .map((categoryKey) => ({
      id: `other-${createSlug(categoryKey)}`,
      label: categoryKey,
      description: `${otherMap.get(categoryKey).length} book${otherMap.get(categoryKey).length === 1 ? '' : 's'}`,
      ebooks: [...otherMap.get(categoryKey)].sort((left, right) => left.title.localeCompare(right.title)),
      children: [],
    }))

  const tree = []

  if (schoolChildren.length) {
    const schoolNode = {
      id: 'school-root',
      label: 'School',
      description: 'Class 9-12 structured subjects',
      ebooks: [],
      children: schoolChildren,
    }
    schoolNode.count = countNodeEbooks(schoolNode)
    tree.push(schoolNode)
  }

  if (otherChildren.length) {
    const otherNode = {
      id: 'other-root',
      label: 'Other Study Materials',
      description: 'Courses, exams, notes and custom folders',
      ebooks: [],
      children: otherChildren,
    }
    otherNode.count = countNodeEbooks(otherNode)
    tree.push(otherNode)
  }

  return tree.map((node) => ({
    ...node,
    count: node.count || countNodeEbooks(node),
    children: node.children.map((child) => ({
      ...child,
      count: child.count || countNodeEbooks(child),
      children: (child.children || []).map((grandchild) => ({
        ...grandchild,
        count: grandchild.count || countNodeEbooks(grandchild),
      })),
    })),
  }))
}
