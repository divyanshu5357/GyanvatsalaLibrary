import { useEffect } from 'react'

const DEFAULT_TITLE = 'Gyanvatsala Library Management System'
const DEFAULT_DESCRIPTION = 'Manage library seats, ebooks, student fees, reminders, and study-room operations from one modern library management system.'
const DEFAULT_IMAGE = '/social-preview.svg'
const DEFAULT_KEYWORDS = 'gyanvatsala, gyanvatsal, gyanvatshala, gyanvatsla, library, study room, reading room, focused study, disciplined routine'

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
  keywords = DEFAULT_KEYWORDS,
}) {
  useEffect(() => {
    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })

    // Open Graph
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: window.location.href })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Gyanvatsala Library' })

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    upsertLink('canonical', window.location.href)

    if (jsonLd) {
      upsertJsonLd(jsonLd)
    }
  }, [description, image, jsonLd, path, robots, title])

  return null
}
