-- Check current status of all designers
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  is_verified, 
  is_approved,
  created_at
FROM designers 
ORDER BY created_at DESC;

-- Update existing designers to have proper approval status
-- Option 1: Set all existing verified designers as NOT approved (recommended for security)
UPDATE designers 
SET is_approved = false 
WHERE is_verified = true 
  AND (is_approved IS NULL OR is_approved = true);

-- Option 2: If you want to approve all existing verified designers at once
-- UPDATE designers 
-- SET is_approved = true 
-- WHERE is_verified = true 
--   AND is_approved IS NULL;

-- Check results after update
SELECT 
  COUNT(*) as total_designers,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_designers,
  COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_designers,
  COUNT(CASE WHEN is_verified = true AND is_approved = true THEN 1 END) as verified_and_approved
FROM designers;