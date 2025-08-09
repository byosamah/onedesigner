-- Migration: Add profile edit tracking for designers
-- Run this in Supabase SQL Editor

-- Add fields to track profile edits after approval
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS last_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS edited_after_approval BOOLEAN DEFAULT FALSE;

-- Update existing approved designers to have last_approved_at
UPDATE designers 
SET last_approved_at = updated_at 
WHERE is_approved = true AND last_approved_at IS NULL;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'designers'
  AND column_name IN ('last_approved_at', 'edited_after_approval');

-- Show some sample data
SELECT 
  id,
  first_name, 
  last_name, 
  is_approved, 
  edited_after_approval,
  last_approved_at,
  updated_at
FROM designers 
LIMIT 10;