-- ============================================
-- TEMPORARY: Disable RLS to fix login
-- ============================================
-- Copy and paste this into Supabase SQL Editor → New Query
-- Then click Run

-- Step 1: Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Step 3: Check if admin profile exists
SELECT * FROM public.users WHERE email = 'admin@lib.com';

-- Result should show the admin profile with role: 'admin'
