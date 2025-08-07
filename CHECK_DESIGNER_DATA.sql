-- Check Osama's designer profile data
SELECT 
  id,
  first_name,
  last_name,
  last_initial,
  title,
  city,
  country,
  email,
  is_approved
FROM designers 
WHERE email = 'osamah96@gmail.com'
   OR (first_name = 'Osama' AND last_name = 'Khalil');

-- If first_name is NULL or empty, update it
UPDATE designers 
SET 
  first_name = 'Osama',
  last_name = 'Khalil',
  last_initial = 'K',
  title = CASE 
    WHEN title IS NULL OR title = '' OR title = 'graphic' 
    THEN 'Senior Product Designer' 
    ELSE title 
  END
WHERE email = 'osamah96@gmail.com'
   OR id = '080fddea-26d8-42e5-a972-e1198bf63d84';

-- Verify the update
SELECT 
  id,
  first_name,
  last_name,
  last_initial,
  title,
  city,
  country,
  email
FROM designers 
WHERE email = 'osamah96@gmail.com';