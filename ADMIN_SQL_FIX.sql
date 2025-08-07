-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Admins can view all designers" ON designers;
DROP POLICY IF EXISTS "Admins can update designer approval" ON designers;

-- Disable RLS on admin_users table (admin table doesn't need RLS)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Make sure the admin user exists (CHANGE THE EMAIL!)
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('admin@onedesigner.com', 'Admin', 'super_admin', true)
ON CONFLICT (email) 
DO UPDATE SET is_active = true;

-- Also update any existing designers to have the is_approved column with proper default
UPDATE designers 
SET is_approved = true 
WHERE is_verified = true 
  AND is_approved IS NULL;