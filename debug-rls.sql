-- Check RLS policies on users table


-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Check if user can read their own profile
-- This tests the 'read_own_profile' policy

-- Disable RLS temporarily to debug
-- ALTER TABLE public.users DISABLE ROW LEVEL SECUaRITY;

-- Or check what's in the users table
SELECT * FROM public.users LIMIT 5;
