-- Migration to add better rejection tracking for designers
-- This allows designers to edit their profile after rejection without tokens

-- Add status column to track designer application state
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update existing designers based on their current state
UPDATE designers
SET status = CASE
    WHEN is_approved = true THEN 'approved'
    WHEN is_approved = false AND rejection_reason IS NOT NULL THEN 'rejected'
    ELSE 'pending'
END;

-- Add columns for tracking rejection feedback visibility
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS rejection_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rejection_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_rejection_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_designers_status ON designers(status);

-- Update rejection count for existing rejected designers
UPDATE designers
SET rejection_count = 1,
    last_rejection_at = updated_at
WHERE status = 'rejected' AND rejection_reason IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN designers.status IS 'Application status: pending, approved, rejected, resubmitted';
COMMENT ON COLUMN designers.rejection_seen IS 'Whether designer has seen the rejection feedback popup';
COMMENT ON COLUMN designers.rejection_count IS 'Number of times the application has been rejected';
COMMENT ON COLUMN designers.last_rejection_at IS 'Timestamp of the most recent rejection';
COMMENT ON COLUMN designers.resubmitted_at IS 'When the designer resubmitted after rejection';

-- Note: The update_token and update_token_expires columns can be removed later
-- once the new flow is confirmed working in production