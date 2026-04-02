import { createClient } from '@supabase/supabase-js'

// Admin client - uses SERVICE ROLE KEY (never expose in frontend!)
// This should ONLY be used in backend/Node.js, not in React
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY // ← Needs to be in .env
)

/**
 * Create a new student account (ADMIN ONLY)
 * Call this from backend/API route, never from frontend directly
 */
export async function createStudentAccount({ email, password, name, role = 'student' }) {
  try {
    console.log('📝 Creating student account:', email)

    // Step 1: Create auth user with service role
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message)
      throw authError
    }

    console.log('✅ Auth user created:', user.id)

    // Step 2: Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: user.id,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      // Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      throw profileError
    }

    console.log('✅ Student account created successfully:', profile)
    return { user, profile }
  } catch (err) {
    console.error('❌ Error creating student account:', err.message)
    throw err
  }
}

/**
 * Fetch all students (ADMIN ONLY)
 */
export async function getAllStudents() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'student')

    if (error) throw error
    return data
  } catch (err) {
    console.error('❌ Error fetching students:', err.message)
    throw err
  }
}

/**
 * Update student profile (ADMIN ONLY)
 */
export async function updateStudent(studentId, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('❌ Error updating student:', err.message)
    throw err
  }
}

/**
 * Delete student account (ADMIN ONLY)
 */
export async function deleteStudent(studentId) {
  try {
    // Delete from database first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', studentId)

    if (dbError) throw dbError

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(studentId)
    if (authError) throw authError

    console.log('✅ Student deleted successfully')
    return true
  } catch (err) {
    console.error('❌ Error deleting student:', err.message)
    throw err
  }
}
