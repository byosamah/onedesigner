-- Debug approval issue
-- Step 1: Check current state of all designers
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  is_verified, 
  is_approved,
  approved_at,
  created_at
FROM designers 
ORDER BY created_at DESC;

-- Step 2: Check if is_approved column exists and has the right type
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'designers' 
  AND column_name IN ('is_verified', 'is_approved');

-- Step 3: Manually approve the first designer (replace with actual designer ID)
-- First, get the designer ID:
SELECT id, first_name, last_name, email FROM designers WHERE is_verified = true LIMIT 1;

-- Then approve them (replace 'YOUR_DESIGNER_ID' with actual ID from above query)
-- UPDATE designers 
-- SET 
--   is_approved = true, 
--   approved_at = NOW()
-- WHERE id = 'YOUR_DESIGNER_ID';

-- Step 4: Verify the update worked
SELECT 
  id, 
  first_name, 
  last_name, 
  is_verified, 
  is_approved,
  approved_at
FROM designers 
WHERE is_approved = true;