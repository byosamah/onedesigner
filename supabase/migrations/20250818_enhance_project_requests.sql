-- Enhance project_requests table for improved working request system
-- Adds tracking, deadline management, and brief snapshot capabilities

-- Add new columns to project_requests table
ALTER TABLE public.project_requests 
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS brief_snapshot JSONB;

-- Add index for deadline queries (for reminder system)
CREATE INDEX IF NOT EXISTS idx_project_requests_deadline 
  ON public.project_requests(response_deadline) 
  WHERE status = 'pending';

-- Add index for viewed status queries
CREATE INDEX IF NOT EXISTS idx_project_requests_viewed 
  ON public.project_requests(viewed_at) 
  WHERE viewed_at IS NOT NULL;

-- Add computed column for checking if request is expired
ALTER TABLE public.project_requests 
  ADD COLUMN IF NOT EXISTS is_expired BOOLEAN 
  GENERATED ALWAYS AS (
    CASE 
      WHEN status = 'pending' AND response_deadline < NOW() THEN true
      ELSE false
    END
  ) STORED;

-- Create function to auto-set response deadline (72 hours from creation)
CREATE OR REPLACE FUNCTION set_response_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_deadline IS NULL THEN
    NEW.response_deadline := NEW.created_at + INTERVAL '72 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set deadline on insert
DROP TRIGGER IF EXISTS trigger_set_response_deadline ON public.project_requests;
CREATE TRIGGER trigger_set_response_deadline
  BEFORE INSERT ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_response_deadline();

-- Create function to auto-reject expired requests
CREATE OR REPLACE FUNCTION auto_reject_expired_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.project_requests
  SET 
    status = 'rejected',
    rejected_at = NOW(),
    rejection_reason = 'Request expired - designer did not respond within 72 hours',
    updated_at = NOW()
  WHERE 
    status = 'pending' 
    AND response_deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: The auto_reject_expired_requests function should be called periodically
-- via a cron job or scheduled task to handle expired requests

-- Add comment documentation
COMMENT ON COLUMN public.project_requests.viewed_at IS 'Timestamp when designer first viewed the request details';
COMMENT ON COLUMN public.project_requests.response_deadline IS 'Deadline for designer to respond (default 72 hours from creation)';
COMMENT ON COLUMN public.project_requests.brief_snapshot IS 'Complete snapshot of brief details at time of request';
COMMENT ON COLUMN public.project_requests.is_expired IS 'Computed column indicating if request has expired';