-- Add missing array columns to designers table
-- These are needed for the application form to work properly

ALTER TABLE designers
ADD COLUMN IF NOT EXISTS project_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS software_skills TEXT[] DEFAULT '{}';

-- Also add the rejection_reason column if it doesn't exist
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Note: The initial schema already has 'styles' and 'industries' as arrays
-- but we also have separate normalized tables for these relationships.
-- The array columns can be used for quick access/caching purposes.