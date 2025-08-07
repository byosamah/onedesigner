-- Add approval fields to designers table
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(200) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Add initial admin user (change email/name as needed)
INSERT INTO admin_users (email, name, role) 
VALUES ('admin@onedesigner.com', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Create index for faster queries
CREATE INDEX idx_designers_is_approved ON designers(is_approved);
CREATE INDEX idx_designers_is_verified ON designers(is_verified);

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all designers" ON designers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_user 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update designer approval" ON designers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_user 
      AND is_active = true
    )
  );