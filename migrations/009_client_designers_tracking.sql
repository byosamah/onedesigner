-- Migration: Track unlocked designers per client
-- Purpose: Ensure designers that have been unlocked by a client never appear again in matches

-- Create client_designers table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique combination of client and designer
  UNIQUE(client_id, designer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_designers_client_id ON client_designers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_designers_designer_id ON client_designers(designer_id);
CREATE INDEX IF NOT EXISTS idx_client_designers_unlocked_at ON client_designers(unlocked_at);

-- Migrate existing unlocked matches to client_designers table
-- This ensures any previously unlocked designers are tracked
INSERT INTO client_designers (client_id, designer_id, unlocked_at)
SELECT DISTINCT 
  m.client_id,
  m.designer_id,
  COALESCE(mu.created_at, m.updated_at, m.created_at) as unlocked_at
FROM matches m
LEFT JOIN match_unlocks mu ON mu.match_id = m.id
WHERE m.status IN ('unlocked', 'accepted', 'completed')
  AND m.client_id IS NOT NULL
  AND m.designer_id IS NOT NULL
ON CONFLICT (client_id, designer_id) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE client_designers IS 'Tracks which designers have been unlocked by each client to prevent duplicates in future matches';
COMMENT ON COLUMN client_designers.unlocked_at IS 'When the client unlocked this designer';