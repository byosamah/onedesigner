-- Add fields to track profile edits after approval
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS last_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS edited_after_approval BOOLEAN DEFAULT FALSE;

-- Update existing approved designers to have last_approved_at
UPDATE designers 
SET last_approved_at = updated_at 
WHERE is_approved = true AND last_approved_at IS NULL;