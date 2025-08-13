-- Migration: Add update_token and update_token_expires columns to designers table
-- Date: 2025-08-13
-- Purpose: Support designer rejection and update application feature

-- Add missing columns to designers table
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_designers_update_token 
ON designers(update_token) 
WHERE update_token IS NOT NULL;

-- Verify columns were added successfully
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'designers' 
AND column_name IN ('update_token', 'update_token_expires', 'rejection_reason')
ORDER BY column_name;

-- Show table info for verification
\d+ designers;