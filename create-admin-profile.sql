-- ============================================
-- CREATE ADMIN PROFILE ROW
-- ============================================
-- Copy and paste this into Supabase SQL Editor
-- Replace the UUID with your actual admin user ID from Authentication

-- First, check what auth users exist
SELECT id, email FROM auth.users LIMIT 10;

-- Then use the ID from the admin user and paste it in this query:
-- Change 'd61b7345-3735-465b-9098-bd3d8b6df860' to your actual admin user ID

INSERT INTO public.users (id, email, name, role, created_at)
VALUES (
  'd61b7345-3735-465b-9098-bd3d8b6df860',
  'admin@lib.com',
  'Admin',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@lib.com',
  name = 'Admin',
  role = 'admin',
  created_at = NOW()
RETURNING *;

-- Verify it was created
SELECT * FROM public.users WHERE email = 'admin@lib.com';
