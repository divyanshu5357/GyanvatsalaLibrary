import fs from 'fs'
import path from 'path'

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const file = fs.readFileSync(filePath, 'utf8')
  const env = {}

  file.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const [key, ...valueParts] = trimmed.split('=')
    if (!key) return
    env[key] = valueParts.join('=').trim()
  })

  return env
}

const cwd = process.cwd()
const env = {
  ...parseEnvFile(path.join(cwd, '.env')),
  ...process.env,
}

const siteUrl = String(env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
const publicDir = path.join(cwd, 'public')
const sitemapPath = path.join(publicDir, 'sitemap.xml')
const robotsPath = path.join(publicDir, 'robots.txt')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /auth
Disallow: /admin/
Disallow: /student/
Disallow: /notifications

Sitemap: ${siteUrl}/sitemap.xml
`

fs.writeFileSync(sitemapPath, sitemap)
fs.writeFileSync(robotsPath, robots)

console.log(`Generated sitemap and robots.txt for ${siteUrl}`)
