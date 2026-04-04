import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

// Load environment variables from .env file manually
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '.env')

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found')
    return {}
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      const value = valueParts.join('=').trim()
      if (key && value) {
        env[key] = value
      }
    }
  })

  return env
}

const env = loadEnv()

const app = express()

// CORS configuration - Allow requests from frontend domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://gyanvatsala.in',
  'https://www.gyanvatsala.in',
  'https://gyanvatsala-library-web.onrender.com',
  'https://library-app-zkyy.onrender.com'
]

// Add Render frontend URL if running on Render
if (process.env.RENDER === 'true') {
  const frontendUrl = process.env.FRONTEND_URL || env.FRONTEND_URL || 'https://gyanvatsala-library-web.onrender.com'
  if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl)
  }
}

console.log('✅ CORS allowed origins:', allowedOrigins)

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('📡 Request with no origin - allowing')
      return callback(null, true)
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS request from allowed origin: ${origin}`)
      return callback(null, true)
    }
    
    // Log denied origins for debugging
    console.warn(`❌ CORS request blocked from origin: ${origin}`)
    return callback(new Error('CORS not allowed'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}))
app.use(express.json())

// Push notifications endpoints disabled (VAPID keys not configured)
app.get('/api/notifications/public-key', (_req, res) => {
  return res.json({ publicKey: null, message: 'Push notifications not configured' })
})

app.post('/api/notifications/subscribe', async (req, res) => {
  return res.json({ success: true, message: 'Push notifications not configured' })
})

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env')
  console.error('   Found:', { supabaseUrl: supabaseUrl ? 'yes' : 'no', serviceRoleKey: serviceRoleKey ? 'yes' : 'no' })
  process.exit(1)
}

console.log('✅ Environment loaded from .env')
console.log('   Supabase URL:', supabaseUrl.substring(0, 30) + '...')

// Initialize admin client with SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

// Regular client for regular operations
const supabase = createClient(supabaseUrl, anonKey)

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.slice(7).trim()
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return res.status(403).json({ error: 'User profile not found' })
    }

    req.authUser = user
    req.authProfile = profile
    next()
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message)
    return res.status(500).json({ error: 'Failed to validate session' })
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.authProfile) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.authProfile.role !== role) {
      return res.status(403).json({ error: `${role} access required` })
    }

    next()
  }
}

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.authUser.id,
      email: req.authUser.email,
    },
    profile: req.authProfile,
  })
})

function formatError(err) {
  if (!err) return { message: 'Unknown error' }
  const message = err.message || String(err)
  return {
    message,
    code: err.code,
    status: err.status,
    hint: err.hint,
    details: err.details,
  }
}

const ALLOWED_EBOOK_CLASS_LEVELS = ['6', '7', '8', '9', '10', '11', '12']
const ALLOWED_EBOOK_CATEGORY_TYPES = ['school', 'other']
const ALLOWED_UPLOAD_TYPES = ['cloudinary', 'external']

function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch (_) {
    return false
  }
}

function normalizeTextValue(value) {
  if (value === undefined) return undefined
  return String(value || '').trim()
}

function normalizeEbookPayload(payload = {}, { partial = false } = {}) {
  const errors = []
  const next = {}

  const title = normalizeTextValue(payload.title)
  const subject = normalizeTextValue(payload.subject)
  const classLevel = normalizeTextValue(payload.class)
  const description = normalizeTextValue(payload.description)
  const categoryType = payload.category_type !== undefined ? normalizeTextValue(payload.category_type).toLowerCase() : undefined
  const customCategory = normalizeTextValue(payload.custom_category)
  const uploadType = payload.upload_type !== undefined ? normalizeTextValue(payload.upload_type).toLowerCase() : undefined
  const fileUrl = normalizeTextValue(payload.file_url)
  const thumbnailUrl = normalizeTextValue(payload.thumbnail_url)
  const filePublicId = normalizeTextValue(payload.file_public_id)
  const thumbnailPublicId = normalizeTextValue(payload.thumbnail_public_id)
  const shouldResolveCategoryType =
    !partial ||
    payload.category_type !== undefined ||
    payload.class !== undefined ||
    payload.subject !== undefined ||
    payload.custom_category !== undefined
  const resolvedCategoryType = shouldResolveCategoryType
    ? (categoryType || (customCategory ? 'other' : 'school'))
    : undefined

  if (!partial || title !== undefined) {
    if (!title) errors.push('title is required')
    else next.title = title
  }

  if (!partial || resolvedCategoryType !== undefined) {
    if (!resolvedCategoryType) {
      errors.push('category_type is required')
    } else if (!ALLOWED_EBOOK_CATEGORY_TYPES.includes(resolvedCategoryType)) {
      errors.push("category_type must be 'school' or 'other'")
    } else {
      next.category_type = resolvedCategoryType
    }
  }

  if (!partial || uploadType !== undefined) {
    if (!uploadType) {
      errors.push('upload_type is required')
    } else if (!ALLOWED_UPLOAD_TYPES.includes(uploadType)) {
      errors.push("upload_type must be 'cloudinary' or 'external'")
    } else {
      next.upload_type = uploadType
    }
  }

  if (!partial || fileUrl !== undefined) {
    if (!fileUrl) {
      errors.push('file_url is required')
    } else if (!isValidHttpUrl(fileUrl)) {
      errors.push('file_url must be a valid public URL')
    } else {
      next.file_url = fileUrl
    }
  }

  if (resolvedCategoryType === 'school') {
    if (!partial || classLevel !== undefined || next.category_type === 'school') {
      if (!classLevel) {
        errors.push('class is required for school ebooks')
      } else if (!ALLOWED_EBOOK_CLASS_LEVELS.includes(classLevel)) {
        errors.push('class must be between 6 and 12')
      } else {
        next.class = classLevel
      }
    }

    if (!partial || subject !== undefined || next.category_type === 'school') {
      if (!subject) {
        errors.push('subject is required for school ebooks')
      } else {
        next.subject = subject
      }
    }

    if (!partial || customCategory !== undefined || next.category_type === 'school') {
      next.custom_category = null
    }
  }

  if (resolvedCategoryType === 'other') {
    if (!partial || customCategory !== undefined || next.category_type === 'other') {
      if (!customCategory) {
        errors.push('custom_category is required for other study materials')
      } else {
        next.custom_category = customCategory
      }
    }

    if (!partial || classLevel !== undefined || next.category_type === 'other') {
      next.class = null
    }

    if (!partial || subject !== undefined || next.category_type === 'other') {
      next.subject = null
    }
  }

  if (description !== undefined) next.description = description || null

  if (thumbnailUrl !== undefined) {
    if (thumbnailUrl && !isValidHttpUrl(thumbnailUrl)) {
      errors.push('thumbnail_url must be a valid public URL')
    } else {
      next.thumbnail_url = thumbnailUrl || null
    }
  } else if (!partial) {
    next.thumbnail_url = null
  }

  if (filePublicId !== undefined) next.file_public_id = filePublicId || null
  if (thumbnailPublicId !== undefined) next.thumbnail_public_id = thumbnailPublicId || null

  return { next, errors }
}

function createCloudinarySignature(params = {}, apiSecret = '') {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(`${sorted}${apiSecret}`).digest('hex')
}

function getUrlFileExtension(fileUrl = '') {
  if (!fileUrl) return ''

  try {
    const pathname = new URL(fileUrl).pathname
    const match = pathname.match(/\.([a-z0-9]+)$/i)
    return match ? match[1].toLowerCase() : ''
  } catch (_) {
    const match = String(fileUrl).match(/\.([a-z0-9]+)(?:[?#].*)?$/i)
    return match ? match[1].toLowerCase() : ''
  }
}

function getCloudinaryResourceType(fileUrl = '') {
  if (!fileUrl) return ''

  try {
    const parts = new URL(fileUrl).pathname.split('/').filter(Boolean)
    return parts[1] ? parts[1].toLowerCase() : ''
  } catch (_) {
    return ''
  }
}

function extractCloudinaryPublicId(fileUrl = '') {
  if (!fileUrl) return ''

  try {
    const parts = new URL(fileUrl).pathname.split('/').filter(Boolean)
    if (parts.length < 4) return ''

    const deliveryParts = parts.slice(3)
    const assetParts = deliveryParts[0]?.match(/^v\d+$/) ? deliveryParts.slice(1) : deliveryParts
    const publicId = assetParts.join('/').replace(/\.[a-z0-9]+$/i, '')

    return publicId
  } catch (_) {
    return ''
  }
}

function buildCloudinaryDownloadUrl({ publicId, format = 'pdf', resourceType = 'image', type = 'upload', attachment = false }) {
  if (!publicId || !cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return null
  }

  const params = {
    attachment,
    format,
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
    type,
  }

  const signature = createCloudinarySignature(params, cloudinaryApiSecret)
  const searchParams = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    api_key: cloudinaryApiKey,
    signature,
  })

  return `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${resourceType}/download?${searchParams.toString()}`
}

async function deleteCloudinaryAsset(publicId, resourceType = 'raw') {
  if (!publicId || !cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return { skipped: true }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = {
    public_id: publicId,
    timestamp,
  }
  const signature = createCloudinarySignature(paramsToSign, cloudinaryApiSecret)

  const formData = new URLSearchParams()
  formData.set('public_id', publicId)
  formData.set('timestamp', String(timestamp))
  formData.set('api_key', cloudinaryApiKey)
  formData.set('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Cloudinary delete failed: ${body}`)
  }

  return response.json()
}

function daysBetween(now, target) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const diff = new Date(target).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)
  return Math.floor(diff / MS_PER_DAY)
}

function isValidDate(value) {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

function isPaidForCurrentCycle(student, feeRecord, referenceDate = new Date()) {
  const rawPayment =
    student?.fee_submission_date ||
    student?.last_payment ||
    feeRecord?.paid_date ||
    feeRecord?.last_paid_date

  if (!isValidDate(rawPayment)) return false

  const paymentDate = new Date(rawPayment)

  return (
    paymentDate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    paymentDate.getUTCMonth() === referenceDate.getUTCMonth()
  )
}

function addOneCalendarMonth(dateInput) {
  const source = new Date(dateInput)
  if (Number.isNaN(source.getTime())) return null

  const year = source.getUTCFullYear()
  const month = source.getUTCMonth()
  const day = source.getUTCDate()

  const targetMonth = month + 1
  const targetYear = year + Math.floor(targetMonth / 12)
  const normalizedTargetMonth = targetMonth % 12

  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, normalizedTargetMonth + 1, 0)).getUTCDate()
  const clampedDay = Math.min(day, lastDayOfTargetMonth)

  return new Date(Date.UTC(targetYear, normalizedTargetMonth, clampedDay, 0, 0, 0, 0))
}

async function upsertNotificationRows(rows = []) {
  if (!rows.length) return
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .upsert(rows, { onConflict: 'dedupe_key' })
    if (error) throw error
  } catch (err) {
    console.warn('⚠️ Persist notifications failed (table missing or constraint absent):', err.message)
  }
}

// Push notifications disabled - stub functions for compatibility
async function getSubscriptionsForUsers(userIds = []) {
  return []
}

async function sendPushToUsers(userIds = [], payload = {}) {
  // Push notifications disabled
}

/**
 * POST /api/admin/create-student
 * Creates a new student account with auth user
 */
app.post('/api/admin/create-student', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      seatNumber,
      feeAmount,
      joinDate,
      dueDate,
      feeSubmissionDate,
      profileImageUrl,
    } = req.body

    const safeEmail = (email || '').trim().toLowerCase()
    const safeName = (name || '').trim()
    const safePhone = (phone || '').trim() || null
    const safeSeat = seatNumber ? Number(seatNumber) : null
    const safeFee = feeAmount ? Number(feeAmount) : null
    const safeJoinDate = joinDate ? new Date(joinDate).toISOString() : new Date().toISOString()
    const safeDueDate = dueDate ? new Date(dueDate).toISOString() : null
    const safeFeeSubmissionDate = feeSubmissionDate ? new Date(feeSubmissionDate).toISOString() : null

    if (!safeEmail || !safeName) {
      return res.status(400).json({ error: 'Email and name are required' })
    }

    console.log('📝 Creating student:', safeEmail)

    // Generate a random password (user should change it on first login)
    const tempPassword = crypto.randomBytes(12).toString('base64url')

    // Step 1: Create auth user with service role
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: safeEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        avatar_url: profileImageUrl || null,
        full_name: safeName,
      },
    })

    if (authError) {
      const formatted = formatError(authError)
      console.error('❌ Failed to create auth user:', formatted)
      return res.status(400).json({ error: formatted.message, details: formatted })
    }

    console.log('✅ Auth user created:', user.id)

    // Step 2: Create user profile in users table
    const now = new Date().toISOString()
    const { data: userRow, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: user.id,
          email: safeEmail,
          name: safeName,
          role: 'student',
          created_at: now,
        },
      ])
      .select()
      .single()

    if (userError) {
      const formatted = formatError(userError)
      console.error('❌ Failed to create user profile:', formatted)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return res.status(400).json({ error: formatted.message, details: formatted })
    }

    console.log('✅ User profile created:', userRow.id)

    // Step 3: Create student record
    const { data: studentRow, error: studentError } = await supabaseAdmin
      .from('students')
      .insert([
        {
          user_id: user.id,
          phone: safePhone,
          seat_number: safeSeat,
          join_date: safeJoinDate,
          last_payment: safeFeeSubmissionDate,
          next_due: safeDueDate,
        },
      ])
      .select()
      .single()

    if (studentError) {
      const formatted = formatError(studentError)
      console.error('❌ Failed to create student record:', formatted)
      await supabaseAdmin.from('users').delete().eq('id', user.id)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return res.status(400).json({ error: formatted.message, details: formatted })
    }

    console.log('✅ Student record created successfully')

    // Step 4: Create fee record if fee amount provided
    if (safeFee) {
      const { error: feeError } = await supabaseAdmin
        .from('fees')
        .insert([
          {
            student_id: studentRow.id,
            amount: safeFee,
            paid_amount: safeFeeSubmissionDate ? safeFee : 0,
            status: safeFeeSubmissionDate ? 'paid' : 'pending',
            created_at: now,
          },
        ])

      if (feeError) {
        console.warn('⚠️ Fee record creation failed (non-critical):', feeError.message)
      }
    }

    return res.json({
      success: true,
      student: {
        id: userRow.id,
        email: safeEmail,
        name: safeName,
        phone: safePhone,
        seatNumber: safeSeat,
        feeAmount: safeFee,
        joinDate: safeJoinDate,
        feeDueDate: safeDueDate,
        feeSubmissionDate: safeFeeSubmissionDate,
        profileImageUrl: profileImageUrl || null,
        tempPassword, // Show temp password once (user should change it)
      },
    })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Server error:', formatted)
    return res.status(500).json({ error: formatted.message, details: formatted })
  }
})

/**
 * GET /api/admin/students
 * Get all students (admin only)
 */
app.get('/api/admin/students', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select('*, user:users(*)')

    if (error) throw error

    // Keep students table as source-of-truth for fee fields
    const enriched = (students || []).map(student => {
      const dueDateObj = student.fee_due_date || student.next_due

      return {
        ...student,
        fee_amount: student.fee_amount,
        fee_due_date: dueDateObj,
        fee_submission_date: student.fee_submission_date || null,
        last_payment: student.last_payment || null,
      }
    })

    return res.json({ success: true, students: enriched })
  } catch (err) {
    console.error('❌ Error fetching students:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// Student self details
app.get('/api/student/me', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const userId = req.authUser.id

    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .maybeSingle()

    if (studentError) throw studentError
    if (!student) return res.status(404).json({ error: 'Student not found' })

    // Keep students table as source-of-truth for fee fields
    const dueDateObj = student.fee_due_date || student.next_due

    return res.json({
      success: true,
      student: {
        ...student,
        fee_amount: student.fee_amount,
        fee_due_date: dueDateObj,
        fee_submission_date: student.fee_submission_date || null,
        last_payment: student.last_payment || null,
      },
    })
  } catch (err) {
    console.error('❌ Error fetching student self record:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// Ebooks: authenticated read for both admin and student
app.get('/api/ebooks', requireAuth, async (req, res) => {
  try {
    const queryClass = req.query.class ? String(req.query.class).trim() : ''
    const querySubject = req.query.subject ? String(req.query.subject).trim() : ''
    const querySearch = req.query.search ? String(req.query.search).trim() : ''
    const queryCategoryType = req.query.categoryType ? String(req.query.categoryType).trim().toLowerCase() : ''
    const queryCustomCategory = req.query.category ? String(req.query.category).trim() : ''

    let query = supabaseAdmin
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false })

    if (queryClass) query = query.eq('class', queryClass)
    if (querySubject) query = query.ilike('subject', `%${querySubject}%`)
    if (queryCategoryType) query = query.eq('category_type', queryCategoryType)
    if (queryCustomCategory) query = query.ilike('custom_category', `%${queryCustomCategory}%`)
    if (querySearch) query = query.or(`title.ilike.%${querySearch}%,subject.ilike.%${querySearch}%,custom_category.ilike.%${querySearch}%`)

    const { data, error } = await query
    if (error) throw error

    return res.json({ success: true, ebooks: data || [] })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error fetching ebooks:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

app.get('/api/ebooks/:ebookId/read-url', requireAuth, async (req, res) => {
  try {
    const { ebookId } = req.params

    const { data: ebook, error } = await supabaseAdmin
      .from('ebooks')
      .select('id, title, upload_type, file_url, file_public_id')
      .eq('id', ebookId)
      .maybeSingle()

    if (error) throw error
    if (!ebook) return res.status(404).json({ error: 'Ebook not found' })
    if (!ebook.file_url) return res.status(400).json({ error: 'Ebook file URL is missing' })

    if (ebook.upload_type !== 'cloudinary') {
      return res.json({ success: true, url: ebook.file_url })
    }

    const publicId = ebook.file_public_id || extractCloudinaryPublicId(ebook.file_url)
    if (!publicId) {
      return res.json({ success: true, url: ebook.file_url })
    }

    const format = getUrlFileExtension(ebook.file_url) || 'pdf'
    const resourceType = getCloudinaryResourceType(ebook.file_url) || 'image'
    const signedUrl = buildCloudinaryDownloadUrl({
      publicId,
      format,
      resourceType,
      type: 'upload',
      attachment: false,
    })

    if (!signedUrl) {
      return res.json({ success: true, url: ebook.file_url })
    }

    return res.json({ success: true, url: signedUrl })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error generating ebook read URL:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: create ebook metadata row
app.post('/api/admin/ebooks', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { next, errors } = normalizeEbookPayload(req.body || {})
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const payload = {
      ...next,
      created_by: req.authUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .insert([payload])
      .select()
      .single()

    if (error) throw error

    return res.json({ success: true, ebook: data })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error creating ebook:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: update ebook metadata
app.patch('/api/admin/ebooks/:ebookId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { ebookId } = req.params
    const { next, errors } = normalizeEbookPayload(req.body || {}, { partial: true })

    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    if (!Object.keys(next).length) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    next.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .update(next)
      .eq('id', ebookId)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Ebook not found' })

    return res.json({ success: true, ebook: data })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error updating ebook:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: delete ebook metadata and optionally Cloudinary assets
app.delete('/api/admin/ebooks/:ebookId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { ebookId } = req.params
    const { deleteCloudinary = false } = req.body || {}

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) return res.status(404).json({ error: 'Ebook not found' })

    if (deleteCloudinary && existing.upload_type === 'cloudinary') {
      try {
        if (existing.file_public_id) {
          await deleteCloudinaryAsset(existing.file_public_id, 'raw')
        }
        if (existing.thumbnail_public_id) {
          await deleteCloudinaryAsset(existing.thumbnail_public_id, 'image')
        }
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary delete skipped/failed:', cloudErr.message)
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('ebooks')
      .delete()
      .eq('id', ebookId)

    if (deleteError) throw deleteError

    return res.json({ success: true })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error deleting ebook:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: update student fields (excluding email/phone)
app.patch('/api/admin/students/:studentId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params
    const {
      name,
      seatNumber,
      feeAmount,
      feeDueDate,
    } = req.body || {}

    // Fetch student to get user_id
    const { data: student, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('id, user_id')
      .eq('id', studentId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!student) return res.status(404).json({ error: 'Student not found' })

    const updates = {}
    if (seatNumber !== undefined) updates.seat_number = seatNumber !== null ? Number(seatNumber) : null
    if (feeAmount !== undefined) updates.fee_amount = feeAmount !== null ? Number(feeAmount) : null
    if (feeDueDate !== undefined) {
      const nextDueIso = feeDueDate ? new Date(feeDueDate).toISOString() : null
      updates.fee_due_date = nextDueIso
      updates.next_due = nextDueIso
    }

    // Update name in users table if provided
    if (name) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ name })
        .eq('id', student.user_id)

      if (userError) throw userError
    }

    if (Object.keys(updates).length > 0) {
      const { error: studentUpdateError } = await supabaseAdmin
        .from('students')
        .update(updates)
        .eq('id', studentId)

      if (studentUpdateError) throw studentUpdateError
    }

    return res.json({ success: true })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error updating student:', formatted)
    if (formatted.message?.includes('duplicate key value')) {
      return res.status(400).json({ error: 'Seat number already taken' })
    }
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: mark fee paid/unpaid for current month
app.post('/api/admin/students/:studentId/fee-status', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params
    const { status } = req.body || {}

    if (!['paid', 'unpaid'].includes(status)) {
      return res.status(400).json({ error: "status must be 'paid' or 'unpaid'" })
    }

    const { data: student, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('id, fee_due_date, next_due, fee_submission_date, last_payment')
      .eq('id', studentId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!student) return res.status(404).json({ error: 'Student not found' })

    if (status === 'paid') {
      const today = new Date()
      const baseDueDate = student.fee_due_date || student.next_due || today.toISOString()
      const nextDueDate = addOneCalendarMonth(baseDueDate)
      if (!nextDueDate) {
        return res.status(400).json({ error: 'Invalid due date for this student' })
      }

      const updates = {
        fee_submission_date: today.toISOString(),
        last_payment: today.toISOString(),
        fee_due_date: nextDueDate.toISOString(),
        next_due: nextDueDate.toISOString(),
      }

      const { error: updateError } = await supabaseAdmin
        .from('students')
        .update(updates)
        .eq('id', studentId)

      if (updateError) throw updateError

      return res.json({
        success: true,
        status: 'paid',
        nextDueDate: nextDueDate.toISOString(),
      })
    }

    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({
        fee_submission_date: null,
        last_payment: null,
      })
      .eq('id', studentId)

    if (updateError) throw updateError

    return res.json({ success: true, status: 'unpaid' })
  } catch (err) {
    const formatted = formatError(err)
    console.error('❌ Error updating fee status:', formatted)
    return res.status(500).json({ error: formatted.message })
  }
})

// Admin: fee notifications (due soon / overdue)
app.get('/api/admin/notifications', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const now = new Date()

    // Fetch students with user and latest fee record (if any)
    const { data: students, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, user_id, join_date, last_payment, next_due, fee_due_date, fee_submission_date, fee_amount, seat_number, phone, user:users(*)')

    if (studentError) throw studentError

    const { data: fees, error: feeError } = await supabaseAdmin
      .from('fees')
      .select('*')

    if (feeError) {
      console.warn('⚠️ Fee lookup for notifications failed:', feeError.message)
    }

    const latestFeeByStudent = (fees || []).reduce((acc, fee) => {
      const existing = acc[fee.student_id]
      const existingDue = existing?.due_date || existing?.next_due_date || null
      const incomingDue = fee?.due_date || fee?.next_due_date || null
      const existingDate = existingDue ? new Date(existingDue) : null
      const incomingDate = incomingDue ? new Date(incomingDue) : null
      if (!existing || (incomingDate && (!existingDate || incomingDate > existingDate))) {
        acc[fee.student_id] = fee
      }
      return acc
    }, {})

    const notifications = []

    for (const student of students || []) {
      const fee = latestFeeByStudent[student.id]
      const dueDate = fee?.due_date || fee?.next_due_date || student.fee_due_date || student.next_due
      if (!dueDate) continue
      if (isPaidForCurrentCycle(student, fee, now)) continue

      const days = daysBetween(now, dueDate)
      const status = days < 0 ? 'overdue' : days <= 3 ? 'due-soon' : null
      if (!status) continue

      const name = student.user?.name || 'Student'
      const feeAmount = student.fee_amount || fee?.amount || null

      notifications.push({
        studentId: student.id,
        userId: student.user_id,
        name,
        email: student.user?.email,
        seatNumber: student.seat_number,
        dueDate,
        daysRemaining: days,
        status,
        feeAmount,
        message: status === 'overdue'
          ? `${name} (Seat ${student.seat_number || 'N/A'}) is overdue by ${Math.abs(days)} day(s).`
          : `${name} (Seat ${student.seat_number || 'N/A'}) fee is due in ${days} day(s).`,
      })
    }

    // Sort overdue first, then soonest
    notifications.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'overdue' ? -1 : 1
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0)
    })

    // Persist and push
    let admins = []
    try {
      const { data } = await supabaseAdmin.from('users').select('id').eq('role', 'admin')
      admins = data || []
    } catch (err) {
      console.warn('⚠️ Fetch admins failed:', err.message)
    }

    const adminRows = []
    const studentRows = []

    notifications.forEach(n => {
      const dedupeKey = `${n.userId}-${n.studentId}-${n.status}-${n.dueDate}`
      studentRows.push({
        user_id: n.userId,
        type: n.status,
        message: n.message,
        dedupe_key: dedupeKey,
        created_at: new Date().toISOString(),
        read: false,
      })

      admins.forEach(a => {
        adminRows.push({
          user_id: a.id,
          type: n.status,
          message: n.message,
          dedupe_key: `${a.id}-${n.studentId}-${n.status}-${n.dueDate}`,
          created_at: new Date().toISOString(),
          read: false,
        })
      })
    })

    await upsertNotificationRows([...adminRows, ...studentRows])

    // Push to admins (summary) and students (per user)
    const adminIdsList = admins.map(a => a.id)
    if (notifications.length && adminIdsList.length) {
      await sendPushToUsers(adminIdsList, { type: 'fee-alert', message: notifications[0].message })
    }

    const studentMessages = {}
    notifications.forEach(n => {
      if (!studentMessages[n.userId]) studentMessages[n.userId] = n.message
    })
    await Promise.all(Object.entries(studentMessages).map(([userId, msg]) => sendPushToUsers([userId], { type: 'fee-alert', message: msg })))

    return res.json({ success: true, notifications })
  } catch (err) {
    console.error('❌ Error building notifications:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/admin/students/:studentId
 * Delete a student (admin only)
 */
app.delete('/api/admin/students/:studentId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params

    // Get the user_id first
    const { data: student, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('user_id')
      .eq('id', studentId)
      .single()

    if (fetchError) throw fetchError

    const userId = student.user_id

    // Delete fee records for this student (if any)
    const { error: deleteFeesError } = await supabaseAdmin
      .from('fees')
      .delete()
      .eq('student_id', studentId)

    if (deleteFeesError) console.warn('⚠️ Failed to delete fee rows:', deleteFeesError.message)

    // Delete student record
    const { error: deleteStudentError } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', studentId)

    if (deleteStudentError) throw deleteStudentError

    // Delete user profile
    const { error: deleteUserError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteUserError) throw deleteUserError

    // Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) console.warn('⚠️ Failed to delete auth user:', deleteAuthError.message)

    return res.json({ success: true, message: 'Student deleted' })
  } catch (err) {
    console.error('❌ Error deleting student:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/admin/set-password
 * Admin sets a student's password directly (no email required)
 */
app.post('/api/admin/set-password', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, newPassword } = req.body

    if (!studentId || !newPassword) {
      return res.status(400).json({ error: 'studentId and newPassword required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Get the user_id from student
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('user_id')
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    const userId = student.user_id

    // Update auth user password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) throw updateError

    console.log(`✅ Password updated for student ${studentId}`)

    return res.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (err) {
    console.error('❌ Error setting password:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/admin/send-reminder
 * Send a fee reminder notification to a student
 */
app.post('/api/admin/send-reminder', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, studentEmail, studentName } = req.body

    if (!studentId || !studentEmail || !studentName) {
      return res.status(400).json({ error: 'studentId, studentEmail, and studentName required' })
    }

    // Create notification record (best-effort)
    let notification = null
    const { data: insertedNotification, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        student_id: studentId,
        type: 'fee_reminder',
        title: 'Fee Reminder',
        message: `Hi ${studentName}, please submit your pending fee at your earliest convenience.`,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (notifError) {
      // Keep reminder endpoint usable even if notifications table isn't created yet
      console.warn('⚠️ Notification record not saved (non-blocking):', notifError.message)
    } else {
      notification = insertedNotification
    }

    // TODO: Send email via email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Reminder sent to ${studentEmail} for ${studentName}`)

    return res.json({
      success: true,
      message: `Reminder sent to ${studentName}`,
      notification,
    })
  } catch (err) {
    console.error('❌ Error sending reminder:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * AUTO-REMINDER SYSTEM
 * Scheduled job that runs daily to send reminders for fees due within 3 days
 */

// Track if auto-reminder is already scheduled to prevent duplicates
let autoReminderScheduled = false

/**
 * Function to check and send reminders to students with fees due soon
 */
async function checkAndSendReminders() {
  try {
    console.log(`\n📅 Running auto-reminder check at ${new Date().toISOString()}`)

    // Get all students with user relationship
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, user_id, phone, fee_amount, fee_due_date, next_due, fee_submission_date, last_payment, user:users(name, email)')

    if (studentsError) throw studentsError

    if (!students || students.length === 0) {
      console.log('ℹ️ No students found')
      return
    }

    // Get all fees to supplement student data
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select('*')

    if (feesError) {
      console.warn('⚠️ Could not fetch fees data:', feesError.message)
    }

    // Create a map of fees by student_id (get the most recent/highest due date)
    const feesByStudent = (fees || []).reduce((acc, fee) => {
      const current = acc[fee.student_id]
      const currentDue = current?.due_date || current?.next_due_date || null
      const incomingDue = fee?.due_date || fee?.next_due_date || null

      if (!current) {
        acc[fee.student_id] = fee
      } else if (incomingDue && (!currentDue || new Date(incomingDue) > new Date(currentDue))) {
        acc[fee.student_id] = fee
      }
      return acc
    }, {})

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let remindersCount = 0

    for (const student of students) {
      try {
        // Get user data
        const userName = student.user?.name || 'Student'
        const userEmail = student.user?.email

        if (!userEmail) {
          console.warn(`⚠️ No email for student ID ${student.id}`)
          continue
        }

        // Determine the due date - use fee record if available, otherwise student field
        const feeRecord = feesByStudent[student.id]
        const dueDate = feeRecord?.due_date || feeRecord?.next_due_date || student.fee_due_date || student.next_due

        if (!dueDate) continue

        if (isPaidForCurrentCycle(student, feeRecord, today)) continue

        const dueDateObj = new Date(dueDate)
        dueDateObj.setHours(0, 0, 0, 0)

        // Calculate days until due
        const daysUntilDue = Math.floor((dueDateObj - today) / (1000 * 60 * 60 * 24))

        // Send reminder if due within 0-3 days
        if (daysUntilDue >= 0 && daysUntilDue <= 3) {
          // Check if a reminder has already been sent today
          const { data: existingReminder, error: checkError } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('student_id', student.id)
            .eq('type', 'fee_reminder')
            .gte('created_at', today.toISOString())
            .limit(1)

          if (checkError) {
            console.warn(`⚠️ Error checking existing reminder for ${userName}:`, checkError.message)
            continue
          }

          // Only send if no reminder was sent today
          if (!existingReminder || existingReminder.length === 0) {
            const daysText = daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
            const amount = student.fee_amount || feeRecord?.amount || 'N/A'
            
            const { error: insertError } = await supabaseAdmin
              .from('notifications')
              .insert({
                student_id: student.id,
                type: 'fee_reminder',
                title: 'Fee Reminder',
                message: `Your fee is due ${daysText}. Please submit your payment at your earliest convenience. Amount: ₹${amount}`,
                read: false,
                created_at: new Date().toISOString(),
              })

            if (insertError) {
              console.warn(`⚠️ Failed to send reminder to ${userName}:`, insertError.message)
            } else {
              console.log(`✅ Reminder sent to ${userName} (${userEmail}) - Due ${daysText}`)
              remindersCount++
            }
          }
        }
      } catch (studentErr) {
        console.warn(`⚠️ Error processing student:`, studentErr.message)
        continue
      }
    }

    console.log(`\n📊 Auto-reminder check complete. ${remindersCount} reminder(s) sent.`)
  } catch (err) {
    console.error('❌ Error in auto-reminder system:', err.message)
  }
}

/**
 * Initialize auto-reminder scheduler
 * Runs once per day at a fixed time (2 AM UTC)
 */
function initializeAutoReminder() {
  if (autoReminderScheduled) {
    console.log('ℹ️ Auto-reminder already scheduled')
    return
  }

  // Calculate time until next 2 AM UTC
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(2, 0, 0, 0)

  const timeUntilNextRun = tomorrow - now

  console.log(`⏰ Auto-reminder system initialized`)
  console.log(`   Next check scheduled in ${Math.floor(timeUntilNextRun / (1000 * 60))} minutes`)

  // Schedule the first run
  setTimeout(() => {
    checkAndSendReminders()

    // Then schedule it to run every 24 hours
    setInterval(() => {
      checkAndSendReminders()
    }, 24 * 60 * 60 * 1000) // Run every 24 hours

    autoReminderScheduled = true
  }, timeUntilNextRun)
}

/**
 * Manual trigger endpoint for testing auto-reminders
 * GET /api/admin/trigger-reminders
 */
app.get('/api/admin/trigger-reminders', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await checkAndSendReminders()
    return res.json({ success: true, message: 'Reminders check triggered' })
  } catch (err) {
    console.error('❌ Error triggering reminders:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ✅ Serve React Frontend (for production build)
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(distPath, 'index.html'))
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  
  // Initialize auto-reminder system
  initializeAutoReminder()
})
