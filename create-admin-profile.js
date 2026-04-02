import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPaths = [
  path.join(__dirname, 'server', '.env'),
  path.join(__dirname, '.env'),
]

function loadEnv() {
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue

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

  console.error('❌ .env file not found')
  return {}
}

const env = loadEnv()
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

/**
 * Create admin profile row manually
 */
async function createAdminProfile() {
  try {
    console.log('📝 Creating admin profile...')

    // Get all auth users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`✅ Found ${users.length} auth users:`)
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`)
    })

    // Find admin user
    const adminUser = users.find(u => u.email === 'admin@lib.com')
    if (!adminUser) {
      console.error('❌ admin@lib.com not found in auth users')
      return
    }

    console.log(`\n📝 Creating profile for admin user: ${adminUser.id}`)

    // Create profile row
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: adminUser.id,
        email: 'admin@lib.com',
        name: 'Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating profile:', error.message)
      return
    }

    console.log('✅ Admin profile created successfully!')
    console.log('   ID:', data.id)
    console.log('   Email:', data.email)
    console.log('   Role:', data.role)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

// Run the function
createAdminProfile()
