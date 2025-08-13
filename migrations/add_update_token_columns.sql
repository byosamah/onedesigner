-- Add update token columns for designer application updates
-- These columns enable the "Update Your Application" feature after rejection

ALTER TABLE designers
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_designers_update_token 
ON designers(update_token) 
WHERE update_token IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN designers.update_token IS 'Unique token for updating rejected applications';
COMMENT ON COLUMN designers.update_token_expires IS 'Expiration time for the update token (7 days from rejection)';

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'designers' 
AND column_name IN ('update_token', 'update_token_expires', 'rejection_reason')
ORDER BY column_name;