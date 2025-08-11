-- Migration: Fix missing client_id in matches table
-- Purpose: Ensure all matches have client_id set based on their brief's client_id

-- Update matches that have a brief_id but no client_id
UPDATE matches m
SET client_id = b.client_id
FROM briefs b
WHERE m.brief_id = b.id
  AND m.client_id IS NULL
  AND b.client_id IS NOT NULL;

-- Log how many records were affected
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % match records with missing client_id', updated_count;
END $$;

-- Add a check constraint to ensure future matches always have a client_id
-- (commented out to avoid breaking existing code that might not set it immediately)
-- ALTER TABLE matches 
-- ADD CONSTRAINT matches_must_have_client CHECK (client_id IS NOT NULL);

-- Create an index on client_id for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_client_id ON matches(client_id);

-- Verify the fix
SELECT 
  COUNT(*) FILTER (WHERE client_id IS NULL) as matches_without_client,
  COUNT(*) FILTER (WHERE client_id IS NOT NULL) as matches_with_client,
  COUNT(*) as total_matches
FROM matches;