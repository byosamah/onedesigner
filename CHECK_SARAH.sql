-- Find Sarah in the database
SELECT 
  id, 
  first_name, 
  last_name, 
  email,
  is_verified, 
  is_approved,
  availability
FROM designers 
WHERE first_name LIKE 'Sarah%' 
   OR first_name LIKE 'sara%';

-- Check all designers that could be matched
SELECT 
  id, 
  first_name, 
  last_name, 
  is_verified, 
  is_approved,
  availability
FROM designers 
WHERE is_verified = true 
  AND availability IN ('available', 'busy')
ORDER BY is_approved DESC, first_name;