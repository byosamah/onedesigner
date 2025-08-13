-- Add update token columns for designer application updates
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_designers_update_token ON designers(update_token) WHERE update_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN designers.update_token IS 'Unique token for updating rejected applications';
COMMENT ON COLUMN designers.update_token_expires IS 'Expiration time for the update token';