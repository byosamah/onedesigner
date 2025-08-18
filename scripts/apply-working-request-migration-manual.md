# 🎯 Working Request System - Database Migration Guide

## Quick Migration (Copy & Paste)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new

### Step 2: Copy and Run This SQL

```sql
-- Add new columns for Working Request System
ALTER TABLE public.project_requests 
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS brief_snapshot JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_requests_deadline 
  ON public.project_requests(response_deadline) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_project_requests_viewed 
  ON public.project_requests(viewed_at) 
  WHERE viewed_at IS NOT NULL;

-- Create automatic deadline trigger (72 hours from creation)
CREATE OR REPLACE FUNCTION set_response_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_deadline IS NULL THEN
    NEW.response_deadline := NEW.created_at + INTERVAL '72 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_response_deadline ON public.project_requests;

-- Create the trigger
CREATE TRIGGER trigger_set_response_deadline
  BEFORE INSERT ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_response_deadline();

-- Verify the migration
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'project_requests' 
  AND column_name IN ('viewed_at', 'response_deadline', 'brief_snapshot');
```

### Step 3: Verify Migration Success

After running the SQL, you should see 3 rows returned:
- `viewed_at` | `timestamp with time zone`
- `response_deadline` | `timestamp with time zone`  
- `brief_snapshot` | `jsonb`

### Step 4: Test the System

Run the verification script:
```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8" node test/working-request-status.js
```

You should see "✅ All required columns present" if successful.

## What This Migration Does

### New Columns Added:

1. **`viewed_at`** - Tracks when designer first views the request
   - Used to show "NEW" badge on unviewed requests
   - Helps track designer engagement

2. **`response_deadline`** - Auto-set to 72 hours after creation
   - Creates urgency for designers to respond
   - Shown as countdown timer in UI

3. **`brief_snapshot`** - Stores complete brief data at request time
   - Ensures designer sees exact brief client submitted
   - Preserves data even if original brief is modified

### Performance Optimizations:

- **Index on `response_deadline`** - Fast queries for pending requests nearing deadline
- **Index on `viewed_at`** - Efficient filtering of viewed/unviewed requests
- **Automatic trigger** - Sets 72-hour deadline without application code

## Testing the Complete Flow

### As a Client:
1. Go to `/client/dashboard`
2. Find an unlocked match
3. Click "Send Working Request"
4. Confirm in the modal (no message needed)
5. See success confirmation

### As a Designer:
1. Go to `/designer/dashboard`
2. See new "Working Request" card with:
   - Match score
   - Brief preview (timeline, budget, industry)
   - Countdown timer (72 hours)
   - "NEW" badge if unviewed
3. Click "View Full Brief"
4. See complete brief details in modal
5. Choose to Accept or Decline

### Email Notifications:
- Designer receives email when request is sent
- Client receives email when designer responds
- All emails use Marc Lou template style

## Troubleshooting

### If migration fails:
- Check you're using the service role key (not anon key)
- Ensure you're in the correct Supabase project
- Try running each ALTER TABLE statement separately

### To rollback (if needed):
```sql
ALTER TABLE public.project_requests 
  DROP COLUMN IF EXISTS viewed_at,
  DROP COLUMN IF EXISTS response_deadline,
  DROP COLUMN IF EXISTS brief_snapshot;

DROP FUNCTION IF EXISTS set_response_deadline() CASCADE;
```

## Success Criteria

The system is ready when:
- ✅ All 3 columns exist in `project_requests` table
- ✅ Status dashboard shows "SYSTEM FULLY OPERATIONAL"
- ✅ Working requests can be created from client dashboard
- ✅ Designers can view and respond to requests
- ✅ Email notifications are sent correctly

---

**Last Updated**: August 18, 2025
**System Version**: 2.2.0 (Working Request System)