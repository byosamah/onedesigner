-- Migration to add project price range columns to designers table
-- This replaces the hourly_rate column with project_price_from and project_price_to

-- Add new columns
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS project_price_from DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS project_price_to DECIMAL(10,2);

-- Copy data from hourly_rate if it exists (as a starting point)
UPDATE designers 
SET 
  project_price_from = CASE 
    WHEN hourly_rate IS NOT NULL THEN hourly_rate * 10  -- Assume minimum 10 hours
    ELSE NULL 
  END,
  project_price_to = CASE 
    WHEN hourly_rate IS NOT NULL THEN hourly_rate * 40  -- Assume maximum 40 hours
    ELSE NULL 
  END
WHERE project_price_from IS NULL AND project_price_to IS NULL;

-- Optional: Drop the old hourly_rate column after verification
-- ALTER TABLE designers DROP COLUMN IF EXISTS hourly_rate;

-- Add comment for documentation
COMMENT ON COLUMN designers.project_price_from IS 'Minimum project price in USD';
COMMENT ON COLUMN designers.project_price_to IS 'Maximum project price in USD';