# Admin Setup Guide

## 1. Run the Admin Migration

First, run this SQL in your Supabase SQL editor:

```sql
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

-- Add initial admin user (CHANGE THIS EMAIL!)
INSERT INTO admin_users (email, name, role) 
VALUES ('admin@onedesigner.com', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX idx_designers_is_approved ON designers(is_approved);
CREATE INDEX idx_designers_is_verified ON designers(is_verified);
```

## 2. Update Admin Email

**IMPORTANT**: Change the admin email in the SQL above to your actual admin email address before running it.

## 3. Access Admin Dashboard

1. Go to `/admin` in your browser
2. Enter your admin email
3. Check your email for the 6-digit OTP code
4. Enter the code to access the admin dashboard

## 4. Admin Features

### Designer Management
- View all designer applications
- Filter by pending, approved, or all
- Approve designers with one click
- Reject designers with a reason
- View designer portfolios and details

### Statistics Overview
- Total designers
- Pending approvals
- Approved designers
- Total clients
- Total matches

### Email Notifications
- Designers receive approval emails
- Designers receive rejection emails with feedback

## 5. Designer Flow

1. **Application**: Designer applies at `/designer/apply`
2. **Verification**: Designer verifies email with OTP
3. **Pending**: Application shows in admin dashboard as "Pending"
4. **Admin Review**: Admin reviews and approves/rejects
5. **Access**: Approved designers can login and access dashboard

## 6. Security

- Admin sessions expire after 24 hours
- OTP codes expire after 10 minutes
- All admin actions are logged with admin ID
- Only verified designers appear for approval