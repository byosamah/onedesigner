-- Add reminder tracking columns to project_requests table
ALTER TABLE project_requests 
ADD COLUMN IF NOT EXISTS first_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS final_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;

-- Add index for finding pending requests efficiently
CREATE INDEX IF NOT EXISTS idx_project_requests_pending_status 
ON project_requests(status, created_at) 
WHERE status = 'pending';

-- Add index for expired requests
CREATE INDEX IF NOT EXISTS idx_project_requests_expired 
ON project_requests(status) 
WHERE status = 'expired';

-- Update any existing 'expired' status if needed (optional)
-- This ensures consistency with the new expired_at column
UPDATE project_requests 
SET expired_at = NOW() 
WHERE status = 'expired' AND expired_at IS NULL;