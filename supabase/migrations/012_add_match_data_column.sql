-- Add match_data JSONB column to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_data JSONB DEFAULT '{}';

-- Add index for better performance when querying match_data
CREATE INDEX IF NOT EXISTS idx_matches_match_data ON matches USING GIN (match_data);

-- Update existing matches to have empty match_data if null
UPDATE matches SET match_data = '{}' WHERE match_data IS NULL;