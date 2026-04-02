import { useEffect } from 'react'

const DEFAULT_TITLE = 'Gyanvatsala Library Management System'
const DEFAULT_DESCRIPTION = 'Manage library seats, ebooks, student fees, reminders, and study-room operations from one modern library management system.'
const DEFAULT_IMAGE = '/social-preview.svg'

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  element.setAttribute('rel', rel)
  element.setAttribute('href', href)
}

function upsertJsonLd(jsonLd) {
  const id = 'app-jsonld'
  let element = document.head.querySelector(`#${id}`)

  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.id = id
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(jsonLd)
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  robots = 'index,follow',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
}) {
  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const canonicalUrl = new URL(normalizedPath, `${siteUrl}/`).toString()
    const imageUrl = image.startsWith('http') ? image : new URL(image, `${siteUrl}/`).toString()

    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Gyanvatsala Library' })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
    upsertLink('canonical', canonicalUrl)

    if (jsonLd) {
      upsertJsonLd(jsonLd)
    }
  }, [description, image, jsonLd, path, robots, title, type])

  return null
}
